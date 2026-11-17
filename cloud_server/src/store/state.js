// ==============================================================================
// EDGE PLATFORM DEMO — CLOUD CONTROL PLANE STATE STORE
// ==============================================================================
// In-memory state store with persistent JSON backing.
// Manages device fleet records, model catalog, provisioning tokens,
// and deployment audit trails.
// ==============================================================================

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../../data/cloud_store.json');

class StateStore {
  constructor() {
    this.devices = new Map();
    this.catalog = new Map();
    this.tokens = new Map();
    this.deployments = new Map();
    this.latestDeployment = null;
    this.events = [];
    this.outliers = [];
    this.tunnel_url = null;
    this.tunnel_proc = null;

    this.initDefaultCatalog();
    this.loadFromDisk();
  }

  initDefaultCatalog() {
    const defaultModels = [
      {
        model_id: "yolov8n-coco",
        name: "YOLOv8-Nano (COCO 80 General Objects)",
        modality: "Vision",
        size_mb: 6.2,
        format: "ONNX",
        description: "General scene detection (person, car, laptop, cell phone, bottle, cup, chair, etc.)",
        download_url: "http://127.0.0.1:8080/models/yolov8n-coco.onnx",
        sha256: "8e2a1b4c6d9f0e3a5b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"
      },
      {
        model_id: "yolov8n-ppe",
        name: "YOLOv8-Nano (Industrial Safety & PPE)",
        modality: "Vision",
        size_mb: 6.2,
        format: "ONNX",
        description: "Worker safety compliance (hardhat, safety_vest, person, gloves, boots)",
        download_url: "http://127.0.0.1:8080/models/yolov8n-ppe.onnx",
        sha256: "2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c"
      },
      {
        model_id: "yolov8n-smoke-fire",
        name: "YOLOv8-Nano (Hazard Flame & Smoke)",
        modality: "Vision",
        size_mb: 6.2,
        format: "ONNX",
        description: "Facility environmental safety & early fire/smoke plume localization",
        download_url: "http://127.0.0.1:8080/models/yolov8n-smoke-fire.onnx",
        sha256: "4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d"
      },
      {
        model_id: "yolov8n-defect",
        name: "YOLOv8-Nano (Manufacturing Defect Inspection)",
        modality: "Vision",
        size_mb: 6.2,
        format: "ONNX",
        description: "High-speed conveyor quality control (crack, scratch, dent, burr, hole)",
        download_url: "http://127.0.0.1:8080/models/yolov8n-defect.onnx",
        sha256: "8e2a1b4c6d9f0e3a5b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"
      },
      {
        model_id: "yolo11n-coco",
        name: "YOLO11-Nano (Ultra-Lightweight SOTA)",
        modality: "Vision",
        size_mb: 5.2,
        format: "ONNX",
        description: "Next-gen edge vision backbone with optimized receptive field for low-power CPUs",
        download_url: "http://127.0.0.1:8080/models/yolo11n-coco.onnx",
        sha256: "6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e"
      },
      {
        model_id: "bearing-1dcnn",
        name: "1D-CNN Predictive Bearing Vibration",
        modality: "Vibration",
        size_mb: 2.3,
        format: "ONNX/TENSOR",
        description: "Analyzes 3-axis accelerometer harmonics for inner/outer race bearing wear (BPFO)",
        download_url: "http://127.0.0.1:8080/models/bearing-1dcnn.bin",
        sha256: "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a"
      },
      {
        model_id: "audio-cavitation",
        name: "Acoustic Leak & Cavitation Detector",
        modality: "Audio",
        size_mb: 3.4,
        format: "SPECTROGRAM",
        description: "Mel-spectrogram audio anomaly detector for pipe hiss & pump cavitation",
        download_url: "http://127.0.0.1:8080/models/audio-cavitation.bin",
        sha256: "5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e"
      },
      {
        model_id: "qwen3-0.6b-diagnostic",
        name: "Qwen-0.6B Edge SLM Diagnostic Reasoner",
        modality: "Text",
        size_mb: 420.0,
        format: "GGUF Q4_K_M",
        description: "Autonomous root-cause diagnostic text generation and technician guidance",
        download_url: "http://127.0.0.1:8080/models/qwen3-0.6b-q4_k_m.gguf",
        sha256: "7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c"
      }
    ];

    for (const model of defaultModels) {
      this.catalog.set(model.model_id, model);
    }
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (data.devices) {
          for (const d of data.devices) this.devices.set(d.device_id, d);
        }
        if (data.tokens) {
          for (const t of data.tokens) this.tokens.set(t.token, t);
        }
      }
    } catch (e) {
      console.warn('[StateStore] Could not load state from disk:', e.message);
    }
  }

  saveToDisk() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const data = {
        devices: Array.from(this.devices.values()),
        tokens: Array.from(this.tokens.values()),
        updated_at: Math.floor(Date.now() / 1000)
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.warn('[StateStore] Could not save state to disk:', e.message);
    }
  }

  logEvent(type, message, details = {}) {
    const event = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      message,
      details,
      timestamp: Math.floor(Date.now() / 1000)
    };
    this.events.unshift(event);
    if (this.events.length > 100) this.events.pop();
    return event;
  }

  logOutlier(outlier) {
    const entry = {
      id: 'out_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      ...outlier,
      timestamp: outlier.timestamp || Math.floor(Date.now() / 1000)
    };
    this.outliers.unshift(entry);
    if (this.outliers.length > 50) this.outliers.pop();
    return entry;
  }

  resetAll() {
    this.devices.clear();
    this.tokens.clear();
    this.deployments.clear();
    this.latestDeployment = null;
    this.events = [];
    this.outliers = [];
    this.saveToDisk();
    this.logEvent('SYSTEM_RESET', 'All devices, tokens, and deployments were cleared from control plane.');
    return { success: true, message: 'All state reset successfully.' };
  }
}

module.exports = new StateStore();
