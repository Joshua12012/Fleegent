# Operational Runbook & Executive Presentation Guide

This document provides step-by-step instructions for running the platform, verifying system health, and conducting an executive presentation.

---

## 1. Quickstart & Operational Commands

### Prerequisites
- **Linux OS** (Ubuntu 22.04+ / Debian 12 / Arch Linux).
- **Rust toolchain** (`cargo`, `rustc`).
- **Node.js** v18+ & `npm`.
- **NATS Server** (`nats-server`).
- **GStreamer 1.0** (`gst-launch-1.0`, `v4l2src`).
- **Llama.cpp** (built in `/home/joshua/llama.cpp/build/bin/llama-server`).

### Step 1: Start the Cloud Control Plane
In terminal 1:
```bash
node cloud_server/src/server.js
```
- Listens on `http://localhost:8080`.
- Serves the Developer Visual Pipeline Canvas and Live AI Inspector.

### Step 2: Start the Edge Client Microservices Suite
In terminal 2:
```bash
./run-edge.sh
```
`run-edge.sh` performs the entire orchestration chain automatically:
1. Compiles the WASM worker to `wasm32-wasip1`.
2. Compiles all Rust microservices in release mode.
3. Launches local NATS broker on `127.0.0.1:4222`.
4. Starts SQLite WAL Storage Service.
5. Launches local Llama.cpp Server (Qwen GGUF) on `127.0.0.1:9931`.
6. Launches Multi-Modal AI Inference Service.
7. Launches Wasmtime 21.0 Sandbox Runtime Host.
8. Boots the Master Client Daemon, streaming real webcam video and kernel thermals.

---

## 2. Executive Presentation Walkthrough

When demonstrating this project to stakeholders, follow this 4-step script:

### Act 1: The Visual Pipeline Canvas (`http://localhost:8080`)
1. Open `http://localhost:8080` in your browser.
2. Show the clean, industrial zinc/slate dark theme.
3. Click **`Clear Canvas`** to show a blank workspace.
4. Click **`+ Add Node`** to add:
   - `Camera (V4L2)` (Source node).
   - `WASM Safety Gatekeeper` (Filter node).
   - `YOLOv8 Object Detector` (Inference node).
5. Drag connections between them (`Camera -> WASM -> YOLOv8`).
6. Click **`Deploy Pipeline`** and highlight how the edge daemon instantly reconfigures its hardware loops without downtime.

### Act 2: Live AI Inspector (`http://localhost:8080/#inspector`)
1. Click the **Live AI Inspector** tab in the top navigation.
2. Point out the **Live Camera Stream**:
   - The green badge `● Live Hardware Camera (/dev/video0)` confirms real hardware capture.
   - Show how the bounding box tracks you (`person`) and any objects (e.g. phone, cup) in front of the lens.
3. Highlight the **WASM Gating Metric**:
   - When still: $\Delta L < 0.03$ (Zero NN compute, saving power).
   - When moving: $\Delta L > 0.12$ (WASM allows frame to pass to YOLOv8 in $<0.02$ms).
4. Point out the **Multi-Modal Gauges**:
   - 3-Axis Vibration ISO-10816 velocity bar (`1.45 mm/s` nominal vs `4.50 mm/s` limit).
   - Acoustic SPL dB and cavitation score.
   - Direct Linux kernel core temperature (`47.0°C` from `/sys/class/thermal/`).

### Act 3: Local Llama.cpp Diagnostic Reasoner
1. Scroll down to the **Edge LLM Diagnostic Console**.
2. Click the quick scenario: `📳 Bearing Vibration Spike`.
3. Click **Run Inference**.
4. Show stakeholders the live generation stats:
   - **~42–45 tokens/second** running locally on your laptop's CPU.
   - **Zero internet access**: Factory telemetry stays 100% on-premises.

### Act 4: Zero-Downtime Hot-Reloading (OTA Drain-and-Swap)
1. Switch to the **Model Catalog** tab.
2. Click **Deploy** on another model (e.g. `MobileNet-Safety` or `YOLOv8-Nano Defect`).
3. Point out terminal logs: the SHA-256 hash is validated, POSIX `rename(2)` commits the file, and NATS broadcasts `admin.reload`.
4. The active model swaps in memory with zero dropped frames.

---

## 3. Troubleshooting & FAQs

### Problem: Camera stream shows "Frame not available yet"
- **Cause**: Another application (Zoom, Teams, Chrome) is holding an exclusive lock on `/dev/video0`.
- **Fix**: Run `fuser -v /dev/video0` and close competing processes, then restart `./run-edge.sh`.

### Problem: Llama.cpp shows "Not reachable on 127.0.0.1:9931"
- **Cause**: `llama-server` did not start or is loading a large model.
- **Fix**: Check `curl http://127.0.0.1:9931/health`. If offline, run:
  `/home/joshua/llama.cpp/build/bin/llama-server --host 127.0.0.1 --port 9931 -m /home/joshua/Downloads/qwen3-0.6b-q4_k_m.gguf -c 1024 -t 4`

### Problem: Do NOT Run `./edge-ctl purge`
- `./edge-ctl purge` completely wipes files and runtime databases. Use `Ctrl+C` to stop processes cleanly instead.
