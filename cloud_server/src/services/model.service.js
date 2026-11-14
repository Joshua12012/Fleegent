// ==============================================================================
// MODEL SERVICE — CATALOG REGISTRY & STAGING
// ==============================================================================

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const store = require('../store/state');

class ModelService {
  getCatalog() {
    return Array.from(store.catalog.values());
  }

  getModelById(modelId) {
    return store.catalog.get(modelId) || null;
  }

  registerModel(modelMeta) {
    store.catalog.set(modelMeta.model_id, modelMeta);
    store.saveToDisk();

    store.logEvent('MODEL_REGISTERED', `Registered model [${modelMeta.name}] in catalog`, {
      model_id: modelMeta.model_id,
      modality: modelMeta.modality,
      size_mb: modelMeta.size_mb
    });

    return modelMeta;
  }

  /**
   * Adds an uploaded model file, computes SHA-256, and stores in data/models/
   */
  processUploadedFile(file, name, modality, description, classes = '') {
    const fileBytes = fs.readFileSync(file.path);
    const hash = crypto.createHash('sha256').update(fileBytes).digest('hex');
    const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
    const modelId = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    const destDir = path.join(__dirname, '../../../data/models');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const finalFilename = `${modelId}${ext}`;
    const finalPath = path.join(destDir, finalFilename);
    fs.copyFileSync(file.path, finalPath);

    // If custom classes are provided, write accompanying label file
    if (classes && classes.trim().length > 0) {
      const classesPath = path.join(destDir, `${modelId}.txt`);
      const formattedClasses = classes.includes('\n') 
        ? classes.trim() 
        : classes.split(',').map(c => c.trim()).filter(Boolean).join('\n');
      fs.writeFileSync(classesPath, formattedClasses);
    }

    const modelMeta = {
      model_id: modelId,
      name: name,
      modality: modality || 'Vision',
      size_mb: sizeMb,
      format: ext.replace('.', '').toUpperCase() || 'BIN',
      description: description || 'Custom uploaded edge model',
      download_url: `http://127.0.0.1:8080/models/${finalFilename}`,
      sha256: hash,
      classes: classes ? classes.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    return this.registerModel(modelMeta);
  }

}

module.exports = new ModelService();
