// ==============================================================================
// MODELS ROUTER — CATALOG REGISTRY & BINARY STAGING
// ==============================================================================

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const modelService = require('../services/model.service');

// Configure multer temporary upload destination
const uploadDir = path.join(__dirname, '../../../data/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

/**
 * GET /api/v1/catalog
 * Lists all models currently in the catalog.
 */
router.get('/catalog', (req, res) => {
  try {
    const catalog = modelService.getCatalog();
    res.json({ success: true, count: catalog.length, catalog });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/catalog/:id
 * Retrieves details for a specific model.
 */
router.get('/catalog/:id', (req, res) => {
  try {
    const model = modelService.getModelById(req.params.id);
    if (!model) {
      return res.status(404).json({ success: false, error: `Model '${req.params.id}' not found` });
    }
    res.json({ success: true, model });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/catalog/upload
 * Accepts a model binary file upload, verifies hash, and registers into catalog.
 */
router.post('/catalog/upload', upload.single('model_file'), (req, res) => {
  try {
    const { name, modality = 'Vision', description = '', classes = '' } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Model name is required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Model binary file is required' });
    }

    const modelRecord = modelService.processUploadedFile(req.file, name, modality, description, classes);

    // Clean up temp upload file
    try {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    } catch (_) {}

    res.status(201).json({
      success: true,
      message: `Model '${name}' uploaded and registered successfully.`,
      model: modelRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
