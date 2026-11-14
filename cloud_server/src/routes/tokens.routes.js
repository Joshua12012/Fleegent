// ==============================================================================
// TOKENS ROUTER — PROVISIONING TOKEN LIFECYCLE
// ==============================================================================

const express = require('express');
const router = express.Router();
const tokenService = require('../services/token.service');
const store = require('../store/state');

/**
 * POST /api/v1/tokens/generate
 * Generates a new provisioning token with optional device_tag and ttl_seconds.
 */
router.post('/generate', (req, res) => {
  try {
    const { device_tag = 'edge-node', ttl_seconds = 3600 } = req.body;
    const tokenRecord = tokenService.generateToken(device_tag, Number(ttl_seconds));

    const host = req.get('host') || '127.0.0.1:8080';
    const protocol = req.protocol || 'http';
    const cloudUrl = store.tunnel_url || `${protocol}://${host}`;
    const bootstrapCurl = `curl -sSL ${cloudUrl}/bootstrap.sh?token=${tokenRecord.token} | bash`;

    res.status(201).json({
      success: true,
      token: tokenRecord.token,
      device_tag: tokenRecord.device_tag,
      expires_at: tokenRecord.expires_at,
      bootstrap_curl: bootstrapCurl,
      record: tokenRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/tokens/latest
 * Returns the latest valid unclaimed provisioning token, or automatically creates one.
 */
router.get('/latest', (req, res) => {
  try {
    const tokens = tokenService.getAllTokens();
    const now = Math.floor(Date.now() / 1000);
    // Find the newest unclaimed and unexpired token
    let latest = tokens.find(t => !t.claimed && t.expires_at > now);

    // If none exists or all are claimed/expired, auto-generate a fresh 24h token
    if (!latest) {
      latest = tokenService.generateToken('edge-node', 86400);
    }

    const host = req.get('host') || '127.0.0.1:8080';
    const protocol = req.protocol || 'http';
    const cloudUrl = store.tunnel_url || `${protocol}://${host}`;
    const bootstrapCurl = `curl -sSL ${cloudUrl}/bootstrap.sh?token=${latest.token} | bash`;

    res.json({
      success: true,
      token: latest,
      bootstrap_curl: bootstrapCurl
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/tokens
 * Lists all generated provisioning tokens with claim status.
 */
router.get('/', (req, res) => {
  try {
    const tokens = tokenService.getAllTokens();
    res.json({ success: true, count: tokens.length, tokens });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
