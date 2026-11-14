// ==============================================================================
// DEPLOYMENT SERVICE — AZURE-STYLE SERVICES DISPATCH & DRAIN-AND-SWAP ACK
// ==============================================================================

const store = require('../store/state');
const modelService = require('./model.service');
const deviceService = require('./device.service');

class DeploymentService {
  /**
   * Dispatches a model deployment or service reconfiguration to a target device (or all devices).
   */
  deployModelToDevice(deviceId, modelId) {
    const model = modelService.getModelById(modelId);
    if (!model) {
      throw new Error(`Model '${modelId}' not found in catalog.`);
    }

    const now = Math.floor(Date.now() / 1000);
    const depId = 'dep_' + Date.now();
    const ext = (model.format && model.format.toUpperCase().includes('ONNX')) ? '.onnx' :
                (model.format && model.format.toUpperCase().includes('GGUF')) ? '.gguf' : '.bin';
    const filePath = `data/models/${model.model_id}${ext}`;

    const reloadCmd = {
      target: 'Model',
      component_id: model.model_id,
      modality: model.modality,
      model_name: model.name,
      file_path: filePath,
      sha256_checksum: model.sha256,
      timestamp: now,
      deployment_id: depId,
      device_id: deviceId
    };

    const record = {
      deployment_id: depId,
      device_id: deviceId,
      model_id: model.model_id,
      model_name: model.name,
      modality: model.modality,
      command: reloadCmd,
      status: 'PENDING',
      created_at: now,
      applied_at: null,
      error_message: null
    };

    store.deployments.set(depId, record);
    store.latestDeployment = reloadCmd;

    // Also update device's configured service record
    if (deviceId && deviceId !== 'all') {
      try {
        deviceService.updateModularServices(deviceId, {
          inference: {
            enabled: true,
            active_model_id: model.model_id,
            modality: model.modality,
            model_path: `data/models/${model.model_id}.bin`,
            confidence_threshold: 0.75,
            memory_cap_mb: 15,
            listen_topic: `inference.${model.modality.toLowerCase()}`,
            publish_topic: 'inference.response'
          }
        });
      } catch (e) {
        // Device might not be claimed yet, continue
      }
    }

    store.logEvent('DEPLOYMENT_DISPATCHED', `Dispatched deployment [${depId}] of model [${model.name}] to device [${deviceId}]`, {
      deployment_id: depId,
      model_id: model.model_id,
      modality: model.modality
    });

    return record;
  }

  getLatestDeployment() {
    return store.latestDeployment;
  }

  getAllDeployments() {
    return Array.from(store.deployments.values()).reverse();
  }

  /**
   * Staged Canary Rollout:
   * Phase 1: Deploy to 1 canary device (10% fleet).
   * Phase 2: Monitor for 10s.
   * Phase 3: Roll out to remaining devices.
   */
  deployCanary(modelId, canaryDeviceId) {
    const model = modelService.getModelById(modelId);
    if (!model) {
      throw new Error(`Model '${modelId}' not found in catalog.`);
    }

    const canaryId = canaryDeviceId || Array.from(store.devices.keys())[0] || 'edge-node-alpha-01';
    const canaryRecord = this.deployModelToDevice(canaryId, modelId);
    canaryRecord.is_canary = true;
    canaryRecord.canary_stage = 'STAGE_1_CANARY_ACTIVE';

    store.logEvent('CANARY_DEPLOYMENT_INITIATED', `Canary rollout started for model [${model.name}] on canary node [${canaryId}]`, {
      canary_device: canaryId,
      model_id: modelId
    });

    // Schedule automatic fleet-wide promotion after 10s if canary remains healthy
    setTimeout(() => {
      const current = store.deployments.get(canaryRecord.deployment_id);
      if (current && current.status !== 'FAILED') {
        current.canary_stage = 'STAGE_2_FLEET_PROMOTED';
        this.deployModelToDevice('all', modelId);
        store.logEvent('CANARY_FLEET_PROMOTED', `Canary probation passed for model [${model.name}]. Full fleet rollout committed!`, {
          model_id: modelId
        });
      }
    }, 10000);

    return canaryRecord;
  }

  /**
   * Processes Drain-and-Swap ACK or Auto-Rollback report from edge device.
   */
  processAck(depId, ackData) {
    const { device_id, status, active_version, latency_ms, error_message } = ackData;
    const now = Math.floor(Date.now() / 1000);

    let record = store.deployments.get(depId);
    if (!record) {
      record = {
        deployment_id: depId,
        device_id,
        status,
        created_at: now
      };
      store.deployments.set(depId, record);
    }

    record.status = status; // "SUCCESS" or "FAILED_ROLLED_BACK"
    record.applied_at = now;
    record.active_version = active_version;
    record.latency_ms = latency_ms;
    record.error_message = error_message;

    // Update device active model
    const device = store.devices.get(device_id);
    if (device && active_version) {
      device.active_model = active_version;
      store.saveToDisk();
    }

    if (status === 'SUCCESS') {
      store.logEvent('DEPLOYMENT_SUCCESS', `Device [${device_id}] applied deployment [${depId}] successfully. Active: ${active_version}`, {
        device_id,
        latency_ms
      });
    } else {
      store.logEvent('DEPLOYMENT_ROLLED_BACK', `⚠️ Device [${device_id}] FAILED deployment [${depId}]. Auto-rollback to previous model executed!`, {
        device_id,
        error: error_message
      });
    }

    return record;
  }
}

module.exports = new DeploymentService();
