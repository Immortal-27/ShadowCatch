const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseAndStore } = require('../services/swaggerParser');
const { refreshCache } = require('../utils/pathMatcher');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `spec-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['.json', '.yaml', '.yml'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only .json, .yaml, and .yml files are allowed'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * POST /api/upload
 * Upload a Swagger/OpenAPI spec file.
 */
router.post('/', upload.single('spec'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const specName = req.body.specName || 'default';
        const result = await parseAndStore(req.file.path, specName);

        // Refresh the path matcher cache
        await refreshCache();

        // Emit spec-updated event via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('spec-updated', result);
        }

        res.json({
            success: true,
            message: `Spec "${result.title}" v${result.version} parsed successfully`,
            ...result,
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({
            error: 'Failed to parse spec file',
            message: err.message,
        });
    }
});

module.exports = router;
