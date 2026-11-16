// ==============================================================================
// TUNNEL ROUTER — CLOUDFLARE PUBLIC TUNNEL FOR COLAB, KAGGLE & WAN CLIENTS
// ==============================================================================

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const store = require('../store/state');

/**
 * Programmatic helper to launch cloudflared tunnel
 */
function launchTunnel(port = 8080) {
  if (store.tunnel_proc && store.tunnel_url) {
    return Promise.resolve(store.tunnel_url);
  }

  return new Promise((resolve) => {
    try {
      const proc = spawn('cloudflared', ['tunnel', '--url', `http://127.0.0.1:${port}`]);
      store.tunnel_proc = proc;
      let urlResolved = false;

      const onData = (data) => {
        const text = data.toString();
        const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        if (match && !urlResolved) {
          urlResolved = true;
          store.tunnel_url = match[0];
          store.logEvent('TUNNEL_STARTED', `Cloudflare Public Tunnel online at ${store.tunnel_url}`);
          resolve(store.tunnel_url);
        }
      };

      proc.stdout.on('data', onData);
      proc.stderr.on('data', onData);

      proc.on('close', (code) => {
        store.tunnel_proc = null;
        store.tunnel_url = null;
        store.logEvent('TUNNEL_CLOSED', `Cloudflare Tunnel process exited with code ${code}`);
      });

      setTimeout(() => {
        if (!urlResolved) resolve(null);
      }, 15000);
    } catch (_) {
      resolve(null);
    }
  });
}

/**
 * GET /api/v1/tunnel
 * Retrieves current public tunnel status and URL.
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    active: !!store.tunnel_url,
    url: store.tunnel_url,
    pid: store.tunnel_proc ? store.tunnel_proc.pid : null
  });
});

/**
 * POST /api/v1/tunnel/start
 * Launches cloudflared tunnel --url http://127.0.0.1:8080 and captures the public HTTPS URL.
 */
router.post('/start', async (req, res) => {
  if (store.tunnel_proc && store.tunnel_url) {
    return res.json({
      success: true,
      message: 'Tunnel is already active.',
      url: store.tunnel_url
    });
  }

  const url = await launchTunnel(8080);
  if (url) {
    return res.json({
      success: true,
      message: 'Public Cloudflare Tunnel established successfully.',
      url
    });
  } else {
    return res.status(504).json({
      success: false,
      error: 'Timed out waiting for Cloudflare Tunnel URL generation.'
    });
  }
});

/**
 * POST /api/v1/tunnel/stop
 * Terminates active cloudflared tunnel process.
 */
router.post('/stop', (req, res) => {
  if (store.tunnel_proc) {
    try {
      store.tunnel_proc.kill('SIGTERM');
    } catch (_) {}
    store.tunnel_proc = null;
  }
  store.tunnel_url = null;
  store.logEvent('TUNNEL_STOPPED', 'Cloudflare Public Tunnel stopped by operator.');
  res.json({ success: true, message: 'Tunnel stopped. Reverted to local networking.' });
});

/**
 * POST /api/v1/tunnel
 * Manually set or override public tunnel URL (e.g. for custom ngrok or domain).
 */
router.post('/', (req, res) => {
  const { public_url } = req.body;
  if (!public_url) {
    return res.status(400).json({ success: false, error: 'public_url string is required.' });
  }
  store.tunnel_url = public_url.trim().replace(/\/+$/, '');
  store.logEvent('TUNNEL_CUSTOM_SET', `Public tunnel URL manually set to ${store.tunnel_url}`);
  res.json({ success: true, url: store.tunnel_url });
});

/**
 * DELETE /api/v1/tunnel
 * Clear custom tunnel URL.
 */
router.delete('/', (req, res) => {
  store.tunnel_url = null;
  res.json({ success: true, message: 'Tunnel URL cleared.' });
});

module.exports = router;
module.exports.launchTunnel = launchTunnel;
