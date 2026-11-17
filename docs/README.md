# Edge Platform Demo — Technical Documentation Hub

Welcome to the comprehensive architecture and operational documentation for the **Edge Platform Demo**. This repository provides an industrial-grade, ultra-low-footprint edge computing and multi-modal AI intelligence platform designed for edge gateways, robotics, factory automation, and local IoT hardware.

---

## 📚 Documentation Index

| Document | Description |
| :--- | :--- |
| **[IEEE LaTeX Research Paper](tether_edge_research_paper.tex)** | Formal IEEE Transactions/Conference LaTeX paper for Tether-Edge, detailing the multi-modal architecture, WASM gating, zero-downtime hot-swapping, and benchmarks. |
| **[Architecture Overview](ARCHITECTURE.md)** | High-level system topology, microservices breakdown, and end-to-end data flow. |
| **[AI Inference Engine](AI_INFERENCE_ENGINE.md)** | Deep dive into real multi-modal models: YOLOv8/YOLO11 COCO object detection, defect inspection, 1D-CNN vibration, acoustic Mel-analysis, and local Llama.cpp GGUF reasoning. |
| **[Hardware Abstraction Layer (HAL)](HARDWARE_HAL.md)** | Direct Linux kernel interfaces: V4L2 camera streaming, sysfs thermal zones, audio DMIC capture, and vibration harmonics. |
| **[WASM Pre-Filter Sandbox](WASM_SANDBOX.md)** | Sub-millisecond WebAssembly linear memory isolation (<0.02ms, 64KB RAM) saving 90%+ edge compute. |
| **[OTA Updates & Hot-Reloading](OTA_DEPLOYMENT.md)** | Zero-downtime Drain-and-Swap model updates, SHA-256 verification, and atomic POSIX renames. |
| **[API & IPC Reference](API_AND_IPC_REFERENCE.md)** | Complete specification of Cloud REST endpoints and NATS message schemas. |
| **[Runbook & Presentation Guide](RUNBOOK_AND_DEMO_GUIDE.md)** | Step-by-step developer setup, operations guide, and executive presentation script. |

---

## ⚡ Core Philosophy & The Crux of the Product

1. **Tiered Edge Execution**: Heavy neural networks are **not** run on every frame or sensor tick. Physical signals pass through lightweight Linux HAL &rarr; sub-0.02ms WASM sandbox &rarr; multi-modal AI models only when changes or anomalies occur.
2. **Real Hardware First**: No fake synthetic surges. Directly reads `/sys/class/thermal/thermal_zone0/temp` and streams real video frames from `/dev/video0`.
3. **Local & Zero-Cloud Leakage**: Sensitive factory video and audio never leave the edge device; inference runs locally on the CPU using native Rust tensor engines and Llama.cpp GGUF quantizations.
4. **Zero-Downtime Hot Swapping**: Operators can switch AI models or WASM rules over the air (OTA) via NATS IPC without restarting the client daemon or dropping in-flight frames.

---

## 🏗️ Repository Layout at a Glance

```
edge-platform-demo/
├── client_daemon/          # [Rust] Master Edge Client Orchestrator & Hardware Abstraction Layer
│   ├── src/hal/            # Physical drivers (V4L2 camera, vibration, audio, thermal sysfs)
│   └── src/main.rs         # Daemon lifecycle, NATS broker sync, cloud HTTP telemetry uplink
├── wasm_host/              # [Rust] Wasmtime 21.0 Sandbox Host (Linear memory mailbox)
├── wasm_worker/            # [Rust -> WASM] Guest bytecode (wasm32-wasip1) rule checker
├── inference_worker/       # [Rust] Multi-Modal AI Engine (YOLO vision, 1D-CNN vibration, Llama.cpp GGUF)
├── storage_service/        # [Rust] SQLite in WAL mode & cryptographic model staging
├── common/                 # [Rust Library] NATS topic constants & Serde data contracts
├── cloud_server/           # [Node.js/Express] Control Plane, Fleet Management & React Dashboard
├── docs/                   # Complete technical documentation suite
├── edge-ctl                # 3-Command Lifecycle CLI (setup, run, purge)
└── run-edge.sh             # Single-command dev launcher & orchestrator
```
