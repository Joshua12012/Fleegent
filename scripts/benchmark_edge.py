#!/usr/bin/env python3
"""Measure end-to-end local NATS telemetry-to-alert latency for Fleegent or an adapter.

This intentionally reports measurements only; it does not fabricate competitor results.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import datetime as dt
import json
import os
import platform
import re
import shutil
import socket
import subprocess
import sys
import time
import uuid
from pathlib import Path
from typing import Any

try:
    import nats
except ImportError as exc:
    raise SystemExit(
        "Missing benchmark dependency. Install it with: "
        "python3 -m pip install -r scripts/requirements-benchmark.txt"
    ) from exc

ROOT = Path(__file__).resolve().parents[1]


def positive_int(value: str) -> int:
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError("must be greater than zero")
    return number


def parse_pids(value: str) -> list[int]:
    try:
        pids = [int(part) for part in value.split(",") if part.strip()]
        if not pids or any(pid < 1 for pid in pids):
            raise ValueError
        return sorted(set(pids))
    except ValueError as exc:
        raise argparse.ArgumentTypeError("expected comma-separated positive PIDs") from exc


def process_snapshot(pids: list[int]) -> dict[str, Any]:
    """Read RSS and CPU counters for explicitly selected Linux processes."""
    if not sys.platform.startswith("linux"):
        raise RuntimeError("--pids resource sampling is currently supported on Linux only")
    page_size = os.sysconf("SC_PAGE_SIZE")
    clock_ticks = os.sysconf("SC_CLK_TCK")
    rss_bytes = 0
    cpu_ticks = 0
    present = []
    per_proc = {}
    for pid in pids:
        try:
            stat = Path(f"/proc/{pid}/stat").read_text()
            statm = Path(f"/proc/{pid}/statm").read_text().split()
            # comm (field 2) can contain spaces and parentheses; parse after its final ')'.
            comm_match = re.search(r"\((.*?)\)", stat)
            comm = comm_match.group(1) if comm_match else str(pid)
            fields = stat[stat.rfind(")") + 2 :].split()
            ticks = int(fields[11]) + int(fields[12])  # utime + stime
            proc_rss = int(statm[1]) * page_size
            cpu_ticks += ticks
            rss_bytes += proc_rss
            present.append(pid)
            per_proc[pid] = {
                "comm": comm,
                "rss_mb": proc_rss / (1024 * 1024),
                "cpu_seconds": ticks / clock_ticks,
            }
        except (FileNotFoundError, PermissionError, IndexError, ValueError):
            continue
    if not present:
        raise RuntimeError(f"None of the selected PIDs are readable: {pids}")
    return {
        "rss_mb": rss_bytes / (1024 * 1024),
        "cpu_seconds": cpu_ticks / clock_ticks,
        "present_pids": present,
        "per_process": per_proc,
    }


class ResourceSampler:
    def __init__(self, pids: list[int], interval_s: float = 0.05):
        self.pids = pids
        self.interval_s = interval_s
        self.baseline: dict[str, Any] | None = None
        self.peak_rss_mb = 0.0
        self.per_proc_peaks: dict[int, float] = {}
        self.max_interval_cpu_pct = 0.0
        self._task: asyncio.Task | None = None
        self._stop = asyncio.Event()
        self._started = 0.0

    async def start(self) -> None:
        self.baseline = process_snapshot(self.pids)
        self.peak_rss_mb = self.baseline["rss_mb"]
        for pid, pdata in self.baseline.get("per_process", {}).items():
            self.per_proc_peaks[pid] = pdata["rss_mb"]
        self._started = time.monotonic()
        self._task = asyncio.create_task(self._sample())

    async def _sample(self) -> None:
        previous = self.baseline
        previous_at = self._started
        while not self._stop.is_set():
            try:
                await asyncio.wait_for(self._stop.wait(), timeout=self.interval_s)
                break
            except asyncio.TimeoutError:
                pass
            current_at = time.monotonic()
            try:
                current = process_snapshot(self.pids)
            except RuntimeError:
                continue
            self.peak_rss_mb = max(self.peak_rss_mb, current["rss_mb"])
            for pid, pdata in current.get("per_process", {}).items():
                self.per_proc_peaks[pid] = max(self.per_proc_peaks.get(pid, 0.0), pdata["rss_mb"])
            elapsed = current_at - previous_at
            if previous and elapsed > 0:
                cpu_pct = max(0.0, (current["cpu_seconds"] - previous["cpu_seconds"]) / elapsed * 100)
                self.max_interval_cpu_pct = max(self.max_interval_cpu_pct, cpu_pct)
            previous, previous_at = current, current_at

    async def stop(self) -> dict[str, Any] | None:
        if not self._task:
            return None
        self._stop.set()
        await self._task
        elapsed = max(time.monotonic() - self._started, 1e-9)
        final = process_snapshot(self.pids)
        self.peak_rss_mb = max(self.peak_rss_mb, final["rss_mb"])
        for pid, pdata in final.get("per_process", {}).items():
            self.per_proc_peaks[pid] = max(self.per_proc_peaks.get(pid, 0.0), pdata["rss_mb"])
        average_cpu_pct = max(0.0, (final["cpu_seconds"] - self.baseline["cpu_seconds"]) / elapsed * 100)

        per_proc_summary = {}
        for pid, pdata in final.get("per_process", {}).items():
            base_rss = self.baseline.get("per_process", {}).get(pid, {}).get("rss_mb", pdata["rss_mb"])
            peak_rss = self.per_proc_peaks.get(pid, pdata["rss_mb"])
            per_proc_summary[str(pid)] = {
                "comm": pdata["comm"],
                "baseline_rss_mb": round(base_rss, 3),
                "peak_rss_mb": round(peak_rss, 3),
            }

        return {
            "baseline_rss_mb": round(self.baseline["rss_mb"], 3),
            "peak_sampled_rss_mb": round(self.peak_rss_mb, 3),
            "average_cpu_pct_of_one_core": round(average_cpu_pct, 3),
            "max_sampled_interval_cpu_pct_of_one_core": round(self.max_interval_cpu_pct, 3),
            "sampling_interval_ms": self.interval_s * 1000,
            "pids": self.pids,
            "per_process": per_proc_summary,
        }


def git_revision() -> str | None:
    try:
        return subprocess.check_output(
            ["git", "-C", str(ROOT), "rev-parse", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return None


def percentile(values: list[float], percentile_value: float) -> float:
    ordered = sorted(values)
    position = (len(ordered) - 1) * percentile_value
    lower = int(position)
    upper = min(lower + 1, len(ordered) - 1)
    fraction = position - lower
    return ordered[lower] * (1 - fraction) + ordered[upper] * fraction


def get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--label", default="fleegent", help="implementation label written to result files")
    parser.add_argument("--nats-url", default="nats://127.0.0.1:4222")
    parser.add_argument("--input-subject", default="telemetry.sensor")
    parser.add_argument("--output-subject", default="telemetry.alert")
    parser.add_argument("--warmup", type=int, default=100, help="unreported warm-up events")
    parser.add_argument("--samples", type=positive_int, default=1000, help="reported anomaly events")
    parser.add_argument("--timeout", type=float, default=5.0, help="seconds to wait for each matching alert")
    parser.add_argument("--pids", type=parse_pids, help="comma-separated PIDs to sample for RSS/CPU (Linux)")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "benchmark_results")
    args = parser.parse_args()
    if args.warmup < 0 or args.timeout <= 0:
        parser.error("--warmup must be non-negative and --timeout must be positive")
    if not re.fullmatch(r"[A-Za-z0-9_.-]+", args.label):
        parser.error("--label may contain only letters, numbers, '.', '_' and '-'")
    return args


async def run(args: argparse.Namespace) -> Path:
    alerts: asyncio.Queue[tuple[float, bytes]] = asyncio.Queue()
    async def on_alert(message: Any) -> None:
        alerts.put_nowait((time.perf_counter(), bytes(message.data)))

    client = await nats.connect(args.nats_url, name=f"fleegent-benchmark-{args.label}")
    await client.subscribe(args.output_subject, cb=on_alert)
    await client.flush(timeout=args.timeout)  # Ensure subscription is active before publishing.

    run_id = uuid.uuid4().hex[:12]
    latencies_ms: list[float] = []
    sample_rows: list[dict[str, Any]] = []
    sampler = ResourceSampler(args.pids) if args.pids else None
    run_started = time.perf_counter()

    async def send_and_wait(index: int, measured: bool) -> float | None:
        metric = f"bench_{run_id}_{'m' if measured else 'w'}_{index}"
        payload = {
            "sensor_id": f"benchmark-{run_id}",
            "metric": metric,
            "value": 90.0,
            "timestamp": int(time.time()),
        }
        encoded = json.dumps(payload, separators=(",", ":")).encode()
        sent_at = time.perf_counter()
        await client.publish(args.input_subject, encoded)
        deadline = asyncio.get_running_loop().time() + args.timeout
        while True:
            remaining = deadline - asyncio.get_running_loop().time()
            if remaining <= 0:
                raise TimeoutError(
                    f"No matching alert for {metric} within {args.timeout}s. "
                    "Check that the implementation is running and subscribed to the input subject."
                )
            received_at, raw = await asyncio.wait_for(alerts.get(), timeout=remaining)
            try:
                alert = json.loads(raw)
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise RuntimeError(f"Non-JSON alert received on {args.output_subject}") from exc
            if alert.get("metric") != metric:
                continue  # Ignore unrelated alerts on a shared broker.
            if measured:
                latency = (received_at - sent_at) * 1000
                sample_rows.append({"sample": index, "metric": metric, "latency_ms": f"{latency:.6f}", "alert": True})
                return latency
            return None

    try:
        for i in range(args.warmup):
            await send_and_wait(i, False)
        if sampler:
            await sampler.start()
        measured_started = time.perf_counter()
        for i in range(args.samples):
            latencies_ms.append(await send_and_wait(i, True))
        measured_elapsed = time.perf_counter() - measured_started
        resource_metrics = await sampler.stop() if sampler else None
    finally:
        if sampler and sampler._task and not sampler._task.done():
            await sampler.stop()
        await client.drain()

    total_elapsed = time.perf_counter() - run_started
    now = dt.datetime.now(dt.timezone.utc)
    safe_url = args.nats_url.rsplit("@", 1)[-1]
    summary: dict[str, Any] = {
        "schema_version": 1,
        "label": args.label,
        "run_id": run_id,
        "created_at_utc": now.isoformat(),
        "git_revision": git_revision(),
        "host": {
            "hostname": socket.gethostname(),
            "platform": platform.platform(),
            "architecture": platform.machine(),
            "logical_cpu_count": os.cpu_count(),
            "python": platform.python_version(),
            "total_memory_mb": next((int(line.split()[1]) / 1024 for line in Path("/proc/meminfo").read_text().splitlines() if line.startswith("MemTotal:")), None) if Path("/proc/meminfo").exists() else None,
        },
        "configuration": {
            "nats_endpoint": safe_url,
            "input_subject": args.input_subject,
            "output_subject": args.output_subject,
            "warmup_events": args.warmup,
            "measured_events": args.samples,
            "event_payload_bytes": len(json.dumps({"sensor_id": "benchmark", "metric": "bench", "value": 90.0, "timestamp": 0}, separators=(",", ":")).encode()),
            "measurement": "sequential anomaly telemetry publish-to-correlated-alert latency; local NATS path",
        },
        "results": {
            "received_expected_alerts": len(latencies_ms),
            "missing_alerts": args.samples - len(latencies_ms),
            "elapsed_measurement_seconds": round(measured_elapsed, 6),
            "round_trip_events_per_second": round(args.samples / measured_elapsed, 3),
            "latency_ms": {
                "min": round(min(latencies_ms), 6),
                "mean": round(sum(latencies_ms) / len(latencies_ms), 6),
                "p50": round(percentile(latencies_ms, 0.50), 6),
                "p95": round(percentile(latencies_ms, 0.95), 6),
                "p99": round(percentile(latencies_ms, 0.99), 6),
                "max": round(max(latencies_ms), 6),
            },
            "process_resources": resource_metrics,
        },
        "notes": [
            "Latency is client-side publish-to-correlated-alert time and includes local NATS transport and scheduling; it is not WASM execution-only latency.",
            "Throughput is sequential round trips, not maximum parallel capacity.",
            "RSS/CPU cover only the explicitly supplied PIDs, not their children, containers, or the full system; RSS is sampled and may miss brief peaks.",
            "This run does not establish a performance comparison with AWS or Azure unless equivalent implementations are measured under a controlled, documented setup.",
        ],
        "total_run_seconds_including_warmup": round(total_elapsed, 6),
    }

    args.output_dir.mkdir(parents=True, exist_ok=True)
    run_dir = args.output_dir / f"{args.label}-{now.strftime('%Y%m%dT%H%M%SZ')}-{run_id}"
    run_dir.mkdir()
    (run_dir / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    with (run_dir / "samples.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["sample", "metric", "latency_ms", "alert"])
        writer.writeheader()
        writer.writerows(sample_rows)
    return run_dir


def main() -> int:
    args = get_args()
    try:
        output = asyncio.run(run(args))
    except (OSError, RuntimeError, TimeoutError, nats.errors.Error) as exc:
        import traceback
        traceback.print_exc()
        return 1
    summary = json.loads((output / "summary.json").read_text())
    results = summary["results"]
    print(f"Results: {output}")
    print(f"Received expected alerts: {results['received_expected_alerts']}/{args.samples}")
    print(f"Latency p50/p95/p99: {results['latency_ms']['p50']}/{results['latency_ms']['p95']}/{results['latency_ms']['p99']} ms")
    print(f"Sequential round-trip throughput: {results['round_trip_events_per_second']} events/s")
    if results["process_resources"]:
        print(f"Sampled process RSS baseline/peak: {results['process_resources']['baseline_rss_mb']}/{results['process_resources']['peak_sampled_rss_mb']} MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
