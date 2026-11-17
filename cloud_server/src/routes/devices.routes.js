// ==============================================================================
// DEVICES ROUTER — FLEET REGISTRY, CLAIM & AZURE-STYLE MODULAR SERVICES
// ==============================================================================

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const deviceService = require('../services/device.service');
const tokenService = require('../services/token.service');
const deploymentService = require('../services/deployment.service');
const store = require('../store/state');

/**
 * GET /api/v1/devices
 * Lists all registered devices with live status and metrics.
 */
router.get('/', (req, res) => {
  try {
    const devices = deviceService.getAllDevices();
    res.json({ success: true, count: devices.length, devices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/devices/prune
 * Prunes stale ghost duplicates from the store database permanently.
 */
router.post('/prune', (req, res) => {
  try {
    const result = deviceService.pruneDuplicateDevices();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/devices/:id
 * Retrieves full details for a single edge device.
 */
router.get('/:id', (req, res) => {
  try {
    const device = deviceService.getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: `Device '${req.params.id}' not found` });
    }
    res.json({ success: true, device });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/devices/claim
 * Called by bootstrap.sh on the edge device to claim token and enroll.
 */
router.post('/claim', (req, res) => {
  try {
    const claimResponse = tokenService.claimToken(req.body);
    if (claimResponse && claimResponse.device_id) {
      deviceService.unpurge(claimResponse.device_id);
    }
    res.status(200).json(claimResponse);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/devices/:id/services
 * Returns Azure-style modular services configuration for a device.
 */
router.get('/:id/services', (req, res) => {
  try {
    if (deviceService.isPurged(req.params.id)) {
      return res.json({
        success: true,
        device_id: req.params.id,
        status: 'PURGED',
        command: 'PURGE',
        services: {}
      });
    }

    const device = deviceService.getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: `Device '${req.params.id}' not found` });
    }
    const cmd = device.pending_command || (device.status === 'STOPPED' ? 'STOP' : null);
    device.pending_command = null;
    res.json({
      success: true,
      device_id: device.device_id,
      status: device.status,
      command: cmd,
      version: device.config?.version || 1,
      services: device.config?.services || {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/devices/:id/services
 * Updates Azure-style modular services configuration (camera, inference, monitoring, storage).
 */
router.post('/:id/services', (req, res) => {
  try {
    const updatedConfig = deviceService.updateModularServices(req.params.id, req.body);
    res.json({
      success: true,
      message: `Modular services updated for ${req.params.id} (v${updatedConfig.version})`,
      config: updatedConfig
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/devices/:id/deploy/:model_id
 * Triggers zero-downtime Drain-and-Swap OTA deployment of a model to this device.
 */
router.post('/:id/deploy/:model_id', (req, res) => {
  try {
    const deployment = deploymentService.deployModelToDevice(req.params.id, req.params.model_id);
    res.status(202).json({
      success: true,
      message: `Deployment dispatched for model ${req.params.model_id}`,
      deployment
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/devices/:id/deployments/:depId/ack
 * Edge daemons submit Drain-and-Swap ACK or auto-rollback reports.
 */
router.post('/:id/deployments/:depId/ack', (req, res) => {
  try {
    const depId = req.params.depId;
    const deviceId = req.params.id;
    const ackData = { ...req.body, device_id: deviceId };
    const record = deploymentService.processAck(depId, ackData);
    res.json({ success: true, record });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/devices/:id/start
 * Launches or resumes the edge client microservices.
 */
router.post('/:id/start', (req, res) => {
  try {
    const result = deviceService.startDevice(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/devices/:id/stop
 * Halts running edge client microservices and sets status to STOPPED.
 */
router.post('/:id/stop', (req, res) => {
  try {
    const result = deviceService.stopDevice(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/devices/:id/purge
 * Stops microservices, wipes edge databases & identity, and purges device from cloud fleet.
 */
router.post('/:id/purge', (req, res) => {
  try {
    const result = deviceService.purgeDevice(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/devices/:id
 * Removes a device from the fleet and purges local edge data.
 */
router.delete('/:id', (req, res) => {
  try {
    const result = deviceService.purgeDevice(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/devices/:id/exec
 * Secure whitelisted diagnostic execution endpoint for the edge terminal console.
 */
router.post('/:id/exec', (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ success: false, error: 'Command string is required.' });
    }

    const trimmed = command.trim();
    // Strict whitelist of safe diagnostic inspection commands
    const allowedPrefixes = [
      'free',
      'df',
      'uptime',
      'uname',
      'v4l2-ctl',
      './edge-ctl status',
      'top -b -n 1',
      'ps aux',
      'ls -la data/models',
      'ls -la /dev/video*'
    ];

    const isAllowed = allowedPrefixes.some(prefix => trimmed === prefix || trimmed.startsWith(prefix + ' '));
    const hasUnsafeChars = /[;&|`$><]/.test(trimmed);

    if (!isAllowed || hasUnsafeChars) {
      return res.status(403).json({
        success: false,
        error: `Command '${trimmed}' is restricted. Only safe whitelisted diagnostic commands (e.g. 'free -h', 'df -h', 'uptime', 'v4l2-ctl --list-devices', './edge-ctl status') are permitted.`
      });
    }

    exec(trimmed, { timeout: 4000, maxBuffer: 1024 * 64 }, (err, stdout, stderr) => {
      res.json({
        success: true,
        command: trimmed,
        output: stdout || stderr || '(No output)',
        exit_code: err ? (err.code || 1) : 0
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
