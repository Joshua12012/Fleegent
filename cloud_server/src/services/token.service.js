// ==============================================================================
// TOKEN SERVICE — DEVICE PROVISIONING & ENROLLMENT
// ==============================================================================

const crypto = require('crypto');
const store = require('../store/state');

class TokenService {
  /**
   * Generates a secure, temporary provisioning token for edge devices.
   */
  generateToken(deviceTag = 'edge-node', ttlSeconds = 3600) {
    const rawToken = 'dev_tok_' + crypto.randomBytes(8).toString('hex');
    const now = Math.floor(Date.now() / 1000);

    const tokenRecord = {
      token: rawToken,
      device_tag: deviceTag,
      created_at: now,
      expires_at: now + ttlSeconds,
      claimed: false,
      claimed_by: null,
      claimed_at: null
    };

    store.tokens.set(rawToken, tokenRecord);
    store.saveToDisk();

    store.logEvent('TOKEN_GENERATED', `New provisioning token generated for [${deviceTag}]`, { token: rawToken });
    return tokenRecord;
  }

  /**
   * Validates and claims a token when an edge device runs bootstrap.sh.
   * Creates initial Azure-style modular device configuration.
   */
  claimToken(claimRequest) {
    const { token, hardware_id, hostname, os_info, arch } = claimRequest;
    const now = Math.floor(Date.now() / 1000);

    const record = store.tokens.get(token);
    if (!record) {
      throw new Error(`Invalid token: '${token}' not found.`);
    }

    if (record.claimed) {
      throw new Error(`Token '${token}' has already been claimed by device '${record.claimed_by}'.`);
    }

    if (now > record.expires_at) {
      throw new Error(`Token '${token}' expired at ${new Date(record.expires_at * 1000).toISOString()}.`);
    }

    // Check if an existing device matches BOTH hardware_id AND hostname (exact same host reconnecting)
    let existingDevice = null;
    if (hardware_id && hardware_id !== 'unknown-mac' && hardware_id !== 'auto-registered') {
      existingDevice = Array.from(store.devices.values()).find(d => 
        d.hardware_id === hardware_id && 
        d.hostname === hostname && 
        d.status !== 'PURGED'
      );
    }

    // Generate unique device ID for this enrollment:
    let deviceId = existingDevice ? existingDevice.device_id : null;
    if (!deviceId) {
      const baseTag = record.device_tag || 'edge-node';
      const shortHw = (hardware_id && hardware_id.length >= 6) ? hardware_id.slice(0, 6) : crypto.randomBytes(3).toString('hex');
      const candidateId = `${baseTag}-${shortHw}`;
      // Ensure candidate ID does not collide with an already registered device
      if (store.devices.has(candidateId)) {
        deviceId = `${baseTag}-${shortHw}-${crypto.randomBytes(2).toString('hex')}`;
      } else {
        deviceId = candidateId;
      }
    }

    const authToken = 'auth_jwt_' + crypto.randomBytes(16).toString('hex');

    // Mark claimed
    record.claimed = true;
    record.claimed_by = deviceId;
    record.claimed_at = now;

    // If existing device found, update and reuse it (identity preserved, 0 duplicates)
    if (existingDevice) {
      existingDevice.hostname = hostname || existingDevice.hostname;
      existingDevice.status = 'ONLINE';
      existingDevice.last_seen = now;
      existingDevice.auth_token = authToken;
      existingDevice.os_info = os_info || existingDevice.os_info;
      existingDevice.arch = arch || existingDevice.arch;
      if (claimRequest.board_model) existingDevice.board_model = claimRequest.board_model;
      store.saveToDisk();
      store.logEvent('DEVICE_RECONNECTED', `Known hardware [${hardware_id.slice(0, 8)}] (${claimRequest.board_model || arch}) reconnected as [${deviceId}]`);
      return {
        success: true,
        device_id: deviceId,
        auth_token: authToken,
        config: existingDevice.config,
        message: 'Device re-enrolled successfully (identity preserved).'
      };
    }

    // Create initial modular device configuration document (Default: Active Camera & Vision Pipeline)
    const initialConfig = {
      device_id: deviceId,
      hostname: hostname || 'edge-device',
      cloud_server_url: store.tunnel_url || process.env.CLOUD_URL || 'http://127.0.0.1:8080',
      nats_url: '127.0.0.1:4222',
      version: 1,
      services: {
        camera: {
          enabled: true,
          device_path: '/dev/video0',
          resolution: [640, 480],
          fps: 5,
          pixel_format: 'RGB24',
          motion_threshold: 0.12,
          publish_topic: 'sensor.camera'
        },
        inference: {
          enabled: true,
          active_model_id: 'yolov8n-coco',
          modality: 'Vision',
          model_path: 'data/models/yolov8n-coco.onnx',
          confidence_threshold: 0.70,
          memory_cap_mb: 15,
          listen_topic: 'inference.vision',
          publish_topic: 'inference.response'
        },
        monitoring: {
          enabled: true,
          wasm_module_path: 'wasm_worker/target/wasm32-wasip1/release/wasm_worker.wasm',
          thermal_zone_path: '/sys/class/thermal/thermal_zone0/temp',
          thermal_alert_celsius: 85.0,
          vibration_iso_threshold_mms: 4.5,
          audio_alert_db: 75.0,
          listen_topics: [
            'sensor.environment',
            'sensor.camera',
            'sensor.vibration',
            'sensor.audio'
          ],
          alert_topic: 'telemetry.alert'
        },
        storage: {
          enabled: true,
          db_path: 'data/edge_storage.db',
          wal_mode: true,
          ring_buffer_capacity: 512,
          flush_interval_secs: 5,
          listen_topic: 'storage.log'
        }
      },
      created_at: now,
      updated_at: now
    };

    // Store device record with active vision pipeline
    const deviceRecord = {
      device_id: deviceId,
      hostname: hostname || 'edge-device',
      hardware_id: hardware_id || 'unknown-mac',
      board_model: claimRequest.board_model || (arch === 'aarch64' ? 'ARM64 Edge Board' : 'x86_64 Edge Node'),
      os_info: os_info || 'Linux',
      arch: arch || 'x86_64',
      status: 'ONLINE',
      last_seen: now,
      auth_token: authToken,
      config: initialConfig,
      telemetry: {
        cpu_usage_pct: 0.0,
        ram_used_mb: 0,
        ram_total_mb: 4096,
        disk_used_mb: 2048,
        temperature_c: 40.0,
        timestamp: now
      },
      active_model: 'yolov8n-coco'
    };

    store.devices.set(deviceId, deviceRecord);
    store.saveToDisk();

    store.logEvent('DEVICE_CLAIMED', `Device [${deviceId}] successfully claimed token and enrolled.`, {
      device_id: deviceId,
      hardware_id,
      arch
    });

    return {
      success: true,
      device_id: deviceId,
      auth_token: authToken,
      config: initialConfig,
      message: 'Device enrolled successfully.'
    };
  }

  getAllTokens() {
    return Array.from(store.tokens.values()).reverse();
  }
}

module.exports = new TokenService();
