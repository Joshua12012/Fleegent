# API & IPC Reference Manual

This document provides the complete API specification for the **Cloud Control Plane REST endpoints** and the **Local NATS IPC Message Schemas**.

---

## 1. Cloud Control Plane REST API (`http://localhost:8080`)

### Telemetry & Real-Time Modalities

#### `GET /api/v1/telemetry/live`
Returns the active multi-modal telemetry streams, current outliers, and device status.
- **Response**:
```json
{
  "success": true,
  "device_id": "my-edge-device-6dec8a",
  "hostname": "joshua-laptop",
  "modalities": {
    "vision": {
      "detections": [
        {
          "label": "person",
          "confidence": 0.634,
          "bbox": [329, 209, 262, 270]
        }
      ],
      "latency_ms": 1,
      "timestamp": 1793284500
    },
    "vibration": {
      "rms_velocity_mms": 1.45,
      "peak_frequency_hz": 30.0,
      "status": "NOMINAL"
    }
  },
  "outliers": []
}
```

#### `GET /api/v1/telemetry/live/frame`
Serves the latest camera frame captured directly from the physical hardware camera (`/dev/video0`).
- **Response**: Binary stream (`Content-Type: image/jpeg`).
- **Headers**: `Cache-Control: no-cache, no-store, must-revalidate`.

#### `POST /api/v1/telemetry/live`
Ingests real-time telemetry from edge daemons.
- **Request Body**:
```json
{
  "device_id": "my-edge-device-6dec8a",
  "modality": "vision",
  "data": { ... },
  "outlier": null
}
```

---

### Local AI & Diagnostic Reasoner

#### `POST /api/v1/inference/chat`
Proxies user inquiries directly to the local `llama.cpp` GGUF engine running on `127.0.0.1:9931`.
- **Request Body**:
```json
{
  "prompt": "Bearing vibration exceeded 4.8 mm/s on motor 2. State root cause and action in 1 sentence.",
  "max_tokens": 100
}
```
- **Response**:
```json
{
  "success": true,
  "content": "The vibration reading indicates bearing wear or misalignment; inspect bearings immediately and replenish lubrication.",
  "model": "qwen3-0.6b-q4_k_m.gguf",
  "tokens_generated": 42,
  "prompt_tokens": 63,
  "timings": {
    "predicted_per_second": 41.95,
    "predicted_ms": 1001.2
  }
}
```

---

### Device Fleet & Deployments

#### `GET /api/v1/devices`
Lists all registered edge devices with system health (CPU, RAM, kernel thermals, active model).

#### `GET /api/v1/catalog`
Lists all downloadable model binaries and metadata (modality, parameters, SHA-256).

#### `POST /api/v1/deployments`
Triggers an Over-The-Air (OTA) Drain-and-Swap model update.
- **Request Body**:
```json
{
  "device_id": "my-edge-device-6dec8a",
  "model_id": "yolov8n-defect",
  "modality": "Vision"
}
```

---

## 2. Local NATS IPC Message Schemas (`127.0.0.1:4222`)

Defined in [`common/src/lib.rs`](file:///home/joshua/edge-platform-demo/common/src/lib.rs):

### Topics Namespaces
| Topic Subject | Purpose |
| :--- | :--- |
| `sensor.camera` | 640×480 video frame payloads published by `client_daemon`. |
| `sensor.vibration` | 3-Axis accelerometer vibration stream (1600 Hz). |
| `sensor.audio` | Acoustic SPL dB and 16-bin Mel-frequency arrays. |
| `telemetry.alert` | High-priority safety anomalies emitted by WASM sandbox. |
| `inference.request` | Inference request sent to `inference_worker`. |
| `inference.response` | Inference results returned by `inference_worker`. |
| `admin.reload` | Hot-swap trigger signal for zero-downtime model swap. |
| `storage.log` | Operational audit trail forwarded to SQLite WAL. |

### Payload Contract Example: `CameraFramePayload`
```rust
#[derive(Serialize, Deserialize)]
pub struct CameraFramePayload {
    pub camera_id: String,       // e.g. "v4l2:/dev/video0"
    pub frame_id: u64,
    pub width: u32,
    pub height: u32,
    pub channels: u8,
    pub format: String,          // "JPEG" or "RGB24"
    pub motion_detected: bool,   // Flagged if ΔL > threshold
    pub data_preview: Vec<u8>,   // Raw preview bytes
    pub timestamp: u64,
}
```

### Payload Contract Example: `InferenceResponse`
```rust
#[derive(Serialize, Deserialize)]
pub struct InferenceResponse {
    pub request_id: String,
    pub output_text: String,
    pub tokens_generated: usize,
    pub latency_ms: u64,
    pub backend: String,
    pub timestamp: u64,
    pub vision_result: Option<VisionInferenceResult>,
    pub vibration_result: Option<VibrationInferenceResult>,
    pub audio_result: Option<AudioInferenceResult>,
}
```
