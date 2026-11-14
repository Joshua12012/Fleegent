// ==============================================================================
// DEVICE SERVICE — FLEET MANAGEMENT & MODULAR SERVICES
// ==============================================================================

const store = require('../store/state');

class DeviceService {
  constructor() {
    this.purgedDeviceIds = new Set();
  }

  isPurged(deviceId) {
    return this.purgedDeviceIds.has(deviceId);
  }

  /**
   * Returns all edge devices with real-time heartbeat calculation.
   * If last_seen > 30s ago, status is marked OFFLINE.
   * Automatically deduplicates any records sharing the same hardware_id.
   */
  getAllDevices() {
    const now = Math.floor(Date.now() / 1000);

    // Group and deduplicate by hardware_id (keeping the newest last_seen record)
    const hardwareMap = new Map();
    for (const d of store.devices.values()) {
      if (d.status === 'PURGED' || this.purgedDeviceIds.has(d.device_id)) {
        continue;
      }
      const hwKey = (d.hardware_id && d.hardware_id !== 'unknown-mac' && d.hardware_id !== 'auto-registered')
        ? d.hardware_id
        : d.device_id;
      const existing = hardwareMap.get(hwKey);
      if (!existing || (d.last_seen || 0) > (existing.last_seen || 0)) {
        hardwareMap.set(hwKey, d);
      }
    }

    const devices = Array.from(hardwareMap.values()).map(device => {
      const isOnline = (now - device.last_seen) <= 30;
      let status = 'OFFLINE';
      if (device.status === 'STOPPED') {
        status = 'STOPPED';
      } else if (isOnline) {
        status = 'ONLINE';
      }
      return {
        ...device,
        status,
        seconds_ago: Math.max(0, now - device.last_seen)
      };
    });

    return devices;
  }

  /**
   * Prunes stale ghost duplicates from the store database permanently.
   */
  pruneDuplicateDevices() {
    const hardwareMap = new Map();
    const keepIds = new Set();

    for (const d of store.devices.values()) {
      const hwKey = (d.hardware_id && d.hardware_id !== 'unknown-mac' && d.hardware_id !== 'auto-registered')
        ? d.hardware_id
        : d.device_id;
      const existing = hardwareMap.get(hwKey);
      if (!existing || (d.last_seen || 0) > (existing.last_seen || 0)) {
        hardwareMap.set(hwKey, d);
      }
    }

    for (const d of hardwareMap.values()) {
      keepIds.add(d.device_id);
    }

    let prunedCount = 0;
    for (const deviceId of Array.from(store.devices.keys())) {
      if (!keepIds.has(deviceId)) {
        store.devices.delete(deviceId);
        prunedCount++;
      }
    }

    if (prunedCount > 0) {
      store.saveToDisk();
      store.logEvent('DEVICES_PRUNED', `Cleaned ${prunedCount} duplicate ghost device records.`);
    }

    return { success: true, pruned_count: prunedCount, remaining_count: store.devices.size };
  }

  getDeviceById(deviceId) {
    const now = Math.floor(Date.now() / 1000);
    const device = store.devices.get(deviceId);
    if (!device) return null;

    const isOnline = (now - device.last_seen) <= 15;
    let status = 'OFFLINE';
    if (device.status === 'STOPPED') {
      status = 'STOPPED';
    } else if (isOnline) {
      status = 'ONLINE';
    }
    return {
      ...device,
      status,
      seconds_ago: Math.max(0, now - device.last_seen)
    };
  }

  /**
   * Ingests real-time telemetry from an edge client daemon.
   */
  ingestTelemetry(payload) {
    const { device_id, hostname, telemetry, active_model } = payload;
    const now = Math.floor(Date.now() / 1000);

    let device = store.devices.get(device_id);
    if (!device) {
      for (const d of store.devices.values()) {
        if (d.device_id === device_id) {
          device = d;
          break;
        }
      }
    }

    // If device was purged, reject auto-registration and command client to purge
    if (this.purgedDeviceIds.has(device_id)) {
      if (device) {
        store.devices.delete(device.device_id);
        store.saveToDisk();
      }
      return {
        status: 'PURGED',
        command: 'PURGE',
        acknowledged_at: now
      };
    }

    // Check if a remote command (STOP or PURGE) is pending for this device
    if (device && device.pending_command) {
      const cmd = device.pending_command;
      if (cmd === 'PURGE') {
        this.purgedDeviceIds.add(device.device_id);
        store.devices.delete(device.device_id);
        store.saveToDisk();
      }
      return {
        status: cmd === 'PURGE' ? 'PURGED' : 'STOPPED',
        command: cmd,
        acknowledged_at: now
      };
    }

    if (device && device.status === 'STOPPED') {
      device.last_seen = now;
      return {
        status: 'STOPPED',
        command: 'STOP',
        acknowledged_at: now
      };
    }

    if (!device) {
      // Auto-register legacy/unclaimed demo device in Standby mode
      device = {
        device_id,
        hostname: hostname || 'edge-device',
        hardware_id: 'auto-registered',
        os_info: 'Linux',
        arch: 'x86_64',
        status: 'ONLINE',
        last_seen: now,
        auth_token: 'auth_jwt_auto',
        config: {
          device_id,
          hostname: hostname || 'edge-device',
          cloud_server_url: 'http://127.0.0.1:8080',
          nats_url: '127.0.0.1:4222',
          version: 0,
          services: {
            camera: { enabled: false, device_path: '/dev/video0', resolution: [640, 480], fps: 5, pixel_format: 'RGB24', motion_threshold: 0.12, publish_topic: 'sensor.camera' },
            inference: { enabled: false, active_model_id: 'yolov8n-defect', modality: 'Vision', model_path: 'data/models/yolov8n-defect.bin', confidence_threshold: 0.70, memory_cap_mb: 15, listen_topic: 'inference.vision', publish_topic: 'inference.response' },
            monitoring: { enabled: false, wasm_module_path: 'wasm_worker/target/wasm32-wasip1/release/wasm_worker.wasm', thermal_zone_path: '/sys/class/thermal/thermal_zone0/temp', thermal_alert_celsius: 85.0, vibration_iso_threshold_mms: 4.5, audio_alert_db: 75.0, listen_topics: ['sensor.environment', 'sensor.camera', 'sensor.vibration', 'sensor.audio'], alert_topic: 'telemetry.alert' },
            storage: { enabled: false, db_path: 'data/edge_storage.db', wal_mode: true, ring_buffer_capacity: 512, flush_interval_secs: 5, listen_topic: 'storage.log' }
          }
        },
        telemetry,
        active_model: active_model || 'None (Standby)'
      };
    }

    device.last_seen = now;
    device.status = 'ONLINE';
    device.telemetry = telemetry;
    if (active_model) device.active_model = active_model;
    if (hostname) device.hostname = hostname;

    store.devices.set(device_id, device);
    store.saveToDisk();

    return {
      status: 'acknowledged',
      acknowledged_at: now
    };
  }

  /**
   * Updates Azure-style modular services for a given device or entire fleet ('all').
   */
  updateModularServices(deviceId, servicesConfig) {
    if (deviceId === 'all') {
      let lastCfg = { version: 1 };
      for (const devId of store.devices.keys()) {
        try {
          lastCfg = this.updateModularServices(devId, servicesConfig);
        } catch (_) {}
      }
      return lastCfg;
    }

    const device = store.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device '${deviceId}' not found.`);
    }

    const now = Math.floor(Date.now() / 1000);
    device.config.version = (device.config.version || 0) + 1;
    const updatedServices = { ...(device.config.services || {}) };
    for (const [key, val] of Object.entries(servicesConfig)) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        updatedServices[key] = { ...(updatedServices[key] || {}), ...val };
      } else {
        updatedServices[key] = val;
      }
    }
    device.config.services = updatedServices;
    device.config.updated_at = now;

    if (updatedServices.inference) {
      if (updatedServices.inference.enabled) {
        device.active_model = updatedServices.inference.active_model_id || 'Configured Model';
      } else {
        device.active_model = 'None (Standby)';
      }
    }

    store.devices.set(deviceId, device);
    store.saveToDisk();

    store.logEvent('SERVICES_CONFIG_UPDATED', `Updated modular services for device [${deviceId}] (v${device.config.version})`, {
      device_id: deviceId,
      version: device.config.version
    });

    return device.config;
  }

  /**
   * Starts edge client microservices on the local host.
   */
  startDevice(deviceId) {
    const { spawn } = require('child_process');
    const path = require('path');
    const rootDir = path.resolve(__dirname, '../../../');

    let device = store.devices.get(deviceId);
    if (!device) {
      for (const d of store.devices.values()) {
        if (d.device_id === deviceId) {
          device = d;
          break;
        }
      }
    }

    this.purgedDeviceIds.delete(deviceId);
    if (device) {
      this.purgedDeviceIds.delete(device.device_id);
      device.status = 'ONLINE';
      device.pending_command = null;
      device.last_seen = Math.floor(Date.now() / 1000);
      store.devices.set(device.device_id, device);
      store.saveToDisk();
    }

    // Only spawn local binaries if explicitly targeting 'local' host
    if (deviceId === 'local') {
      try {
        const child = spawn('./run-edge.sh', ['run'], {
          cwd: rootDir,
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        store.logEvent('DEVICE_STARTED', `Dispatched local start signal.`);
        return { success: true, message: `Local edge microservices launched.` };
      } catch (err) {
        throw new Error(`Failed to launch edge client: ${err.message}`);
      }
    }

    store.logEvent('DEVICE_ONLINE_ACK', `Device [${deviceId}] marked active. Awaiting remote client heartbeat.`);
    return { success: true, message: `Device '${deviceId}' marked active.` };
  }

  /**
   * Gracefully stops running edge client microservices and marks device status STOPPED.
   */
  stopDevice(deviceId) {
    const { execSync } = require('child_process');
    let device = store.devices.get(deviceId);
    if (!device) {
      for (const d of store.devices.values()) {
        if (d.device_id === deviceId) {
          device = d;
          break;
        }
      }
    }

    if (device) {
      device.status = 'STOPPED';
      device.pending_command = 'STOP';
      device.stopped_at = Math.floor(Date.now() / 1000);
      store.devices.set(device.device_id, device);
      store.saveToDisk();
    }

    // Stop local edge microservices and kill any orphaned camera streamers
    try {
      execSync('killall -9 client_daemon inference_worker wasm_host storage_service gst-launch-1.0 ffmpeg 2>/dev/null || true');
      execSync('pkill -x client_daemon 2>/dev/null || true');
      execSync('pkill -x inference_worker 2>/dev/null || true');
      execSync('pkill -x wasm_host 2>/dev/null || true');
      execSync('pkill -x storage_service 2>/dev/null || true');
      execSync('pkill -f "gst-launch-1.0|ffmpeg -f v4l2" 2>/dev/null || true');
      execSync('rm -f /tmp/edge_live_frame.jpg 2>/dev/null || true');
    } catch (_) {}

    store.logEvent('DEVICE_STOPPED', `Device [${deviceId}] microservices stopped.`);
    return { success: true, message: `Device '${deviceId}' stopped successfully.` };
  }

  /**
   * Completely purges the device: stops microservices, wipes local edge databases & identity,
   * and permanently removes the record from cloud fleet storage.
   */
  purgeDevice(deviceId) {
    const { execSync } = require('child_process');
    const path = require('path');
    const rootDir = path.resolve(__dirname, '../../../');

    // 1. Terminate edge client microservices and video streams
    try {
      execSync('killall -9 client_daemon inference_worker wasm_host storage_service gst-launch-1.0 ffmpeg 2>/dev/null || true');
      execSync('pkill -x client_daemon 2>/dev/null || true');
      execSync('pkill -x inference_worker 2>/dev/null || true');
      execSync('pkill -x wasm_host 2>/dev/null || true');
      execSync('pkill -x storage_service 2>/dev/null || true');
      execSync('pkill -f "gst-launch-1.0|ffmpeg -f v4l2" 2>/dev/null || true');
      execSync('rm -f /tmp/edge_live_frame.jpg 2>/dev/null || true');
    } catch (_) {}

    // 2. Wipe local runtime databases and identity config if they exist
    try {
      execSync(`rm -rf "${path.join(rootDir, 'data/*.db')}" "${path.join(rootDir, 'data/*.db-wal')}" "${path.join(rootDir, 'data/*.db-shm')}" "${path.join(rootDir, 'data/edge.json')}" 2>/dev/null || true`);
    } catch (_) {}

    // 3. Mark purged in memory and remove from cloud store
    this.purgedDeviceIds.add(deviceId);
    let targetKey = deviceId;
    if (!store.devices.has(deviceId)) {
      for (const [key, d] of store.devices.entries()) {
        if (d.device_id === deviceId) {
          targetKey = key;
          break;
        }
      }
    }

    if (store.devices.has(targetKey)) {
      const dev = store.devices.get(targetKey);
      if (dev) {
        this.purgedDeviceIds.add(dev.device_id);
      }
      store.devices.delete(targetKey);
      store.saveToDisk();
    }

    store.logEvent('DEVICE_PURGED', `Device [${deviceId}] and all associated local data purged.`);
    return { success: true, message: `Device '${deviceId}' and all edge data successfully purged.` };
  }
}

module.exports = new DeviceService();
