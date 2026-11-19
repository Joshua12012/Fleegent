// ==============================================================================
// EDGE FLEET MANAGEMENT PLATFORM — CLOUD CONTROL PLANE SERVER
// ==============================================================================
// Production-grade Express / Node.js Backend
// Manages: Device Fleet Registry, Modular Services, Provisioning Tokens,
//          Model Catalog, OTA Deployments, and Real-time Telemetry Ingestion.
// ==============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const bootstrapRoutes = require('./routes/bootstrap.routes');
const tokensRoutes = require('./routes/tokens.routes');
const devicesRoutes = require('./routes/devices.routes');
const telemetryRoutes = require('./routes/telemetry.routes');
const modelsRoutes = require('./routes/models.routes');
const deploymentsRoutes = require('./routes/deployments.routes');
const tunnelRoutes = require('./routes/tunnel.routes');
const store = require('./store/state');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure required runtime directories
const rootDir = path.resolve(__dirname, '../../');
const dataDir = path.join(rootDir, 'data');
const modelsDir = path.join(dataDir, 'models');
const uploadsDir = path.join(dataDir, 'uploads');
[dataDir, modelsDir, uploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Ensure default dummy model binaries exist for realistic HTTP downloads
const crypto = require('crypto');
const defaultModels = [
  'yolov8n-defect.bin',
  'mobilenet-safety.bin',
  'bearing-1dcnn.bin',
  'audio-cavitation.bin',
  'smollm-135m-q4.gguf'
];
defaultModels.forEach(filename => {
  const filePath = path.join(modelsDir, filename);
  if (!fs.existsSync(filePath)) {
    const dummyBytes = Buffer.from(`EDGE_PLATFORM_QUANTIZED_MODEL_HEADER\nID:${filename}\nTIMESTAMP:${Date.now()}\n`);
    fs.writeFileSync(filePath, dummyBytes);
    // Update SHA-256 in store
    const hash = crypto.createHash('sha256').update(dummyBytes).digest('hex');
    const modelId = filename.replace(/\.(bin|gguf)$/, '');
    if (store.catalog.has(modelId)) {
      const m = store.catalog.get(modelId);
      m.sha256 = hash;
      store.catalog.set(modelId, m);
    }
  }
});

// Static binary downloads for edge nodes
app.use('/models', express.static(modelsDir));
app.use('/scripts', express.static(path.join(rootDir, 'scripts')));

// Pre-built edge client bundles for zero-touch curl installation (multi-arch support)
const serveBundle = (filename, req, res) => {
  const bundlePath = path.join(dataDir, filename);
  if (fs.existsSync(bundlePath)) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.download(bundlePath, filename);
  } else {
    // Fallback to default bundle
    const fallbackPath = path.join(dataDir, 'edge-client-bundle.tar.gz');
    if (fs.existsSync(fallbackPath)) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.download(fallbackPath, 'edge-client-bundle.tar.gz');
    } else {
      res.status(404).send('Edge bundle not found');
    }
  }
};

app.get('/edge-client-bundle.tar.gz', (req, res) => serveBundle('edge-client-bundle.tar.gz', req, res));
app.get('/edge-client-bundle-arm64.tar.gz', (req, res) => serveBundle('edge-client-bundle-arm64.tar.gz', req, res));
app.get('/edge-client-bundle-x86_64.tar.gz', (req, res) => serveBundle('edge-client-bundle-x86_64.tar.gz', req, res));

// Static files for the frontend dashboard
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Auto-compile app.jsx -> app.js if app.jsx is newer by at least 2 seconds or app.js is missing
try {
  const jsxPath = path.join(publicDir, 'app.jsx');
  const jsPath = path.join(publicDir, 'app.js');
  const babelVendorPath = path.join(publicDir, 'vendor', 'babel.min.js');
  if (fs.existsSync(jsxPath) && fs.existsSync(babelVendorPath)) {
    const jsxMtime = fs.statSync(jsxPath).mtimeMs;
    const jsMtime = fs.existsSync(jsPath) ? fs.statSync(jsPath).mtimeMs : 0;
    if ((jsxMtime - jsMtime > 2000) || !fs.existsSync(jsPath)) {
      const Babel = require(babelVendorPath);
      const code = fs.readFileSync(jsxPath, 'utf8');
      const transpiled = Babel.transform(code, {
        presets: [['react', { runtime: 'classic' }]]
      }).code;
      fs.writeFileSync(jsPath, transpiled);
      console.log(`[CloudServer] Auto-transpiled app.jsx -> app.js (${transpiled.length} bytes)`);
    }
  }
} catch (e) {
  console.warn('[CloudServer] JSX transpile notice:', e.message);
}

// Serve public static frontend files with fast caching for local client assets
app.use(express.static(publicDir, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

// Mount Routes
app.use('/', bootstrapRoutes);
app.use('/api/v1/tokens', tokensRoutes);
app.use('/api/v1/devices', devicesRoutes);
app.use('/api/v1', telemetryRoutes);
app.use('/api/v1', modelsRoutes);
app.use('/api/v1/deployments', deploymentsRoutes);
app.use('/api/v1/tunnel', tunnelRoutes);

// System state reset
app.post('/api/v1/reset', (req, res) => {
  const deviceService = require('./services/device.service');
  deviceService.purgedDeviceIds.clear();
  res.json(store.resetAll());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime_seconds: process.uptime(),
    devices_count: store.devices.size,
    tokens_count: store.tokens.size,
    catalog_count: store.catalog.size,
    timestamp: Math.floor(Date.now() / 1000)
  });
});

// Fallback to index.html for SPA frontend
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/') || req.path.startsWith('/models/') || req.path === '/bootstrap.sh') {
    return next();
  }
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Edge Fleet Management Server is running. UI initializing...');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[CloudServer Error]', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Process resilience
process.on('uncaughtException', (err) => {
  console.warn('[CloudServer Resilience] Caught exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[CloudServer Resilience] Unhandled rejection:', reason);
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================================`);
  console.log(`TETHER-EDGE PLATFORM — CLOUD CONTROL PLANE`);
  console.log(`================================================================`);
  console.log(`  Server listening on:  http://0.0.0.0:${PORT}`);
  console.log(`  Dashboard UI:         http://localhost:${PORT}`);
  console.log(`  Bootstrap endpoint:   http://localhost:${PORT}/bootstrap.sh`);
  console.log(`  Model binaries:       http://localhost:${PORT}/models/`);
  console.log(`================================================================`);

  // Automatically start Cloudflare tunnel in background if cloudflared is installed
  const { launchTunnel } = require('./routes/tunnel.routes');
  launchTunnel(PORT).then(tunnelUrl => {
    if (tunnelUrl) {
      console.log(`  Cloudflare Public Tunnel Online: ${tunnelUrl}`);
      console.log(`================================================================`);
    }
  }).catch(() => {});
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [CloudServer] Port ${PORT} is already in use by another running process.`);
    console.error(`   To free port ${PORT} automatically, run: make server (or: fuser -k ${PORT}/tcp)\n`);
    process.exit(1);
  } else {
    console.error('[CloudServer Error]', err.message);
    process.exit(1);
  }
});

module.exports = app;
