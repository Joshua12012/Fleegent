// ==============================================================================
// DEPLOYMENTS ROUTER — OTA DISPATCH, POLLING & DRAIN-AND-SWAP ACK
// ==============================================================================

const express = require('express');
const router = express.Router();
const deploymentService = require('../services/deployment.service');

/**
 * GET /api/v1/deployments/latest
 * Edge daemons poll this endpoint to discover pending OTA updates.
 * Returns null or ReloadCommand object.
 */
router.get('/latest', (req, res) => {
  try {
    const latest = deploymentService.getLatestDeployment();
    // Return null or object (client_daemon parses as Option<ReloadCommand>)
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/v1/deployments
 * Lists all deployment audit records.
 */
router.get('/', (req, res) => {
  try {
    const deployments = deploymentService.getAllDeployments();
    res.json({ success: true, count: deployments.length, deployments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/deployments/canary
 * Staged canary rollout endpoint (10% canary -> verify 10s -> full fleet).
 */
router.post('/canary', (req, res) => {
  try {
    const { model_id, canary_device_id } = req.body;
    if (!model_id) {
      return res.status(400).json({ success: false, error: 'model_id is required' });
    }
    const record = deploymentService.deployCanary(model_id, canary_device_id);
    res.json({ success: true, message: 'Canary rollout initiated', record });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/deployments/:depId/ack
 * Direct ACK endpoint (convenience alias).
 */
router.post('/:depId/ack', (req, res) => {
  try {
    const depId = req.params.depId;
    const record = deploymentService.processAck(depId, req.body);
    res.json({ success: true, record });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
