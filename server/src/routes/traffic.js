const express = require('express');
const TrafficLog = require('../models/TrafficLog');

const router = express.Router();

/**
 * GET /api/traffic
 * Retrieve traffic logs with optional filtering.
 */
router.get('/', async (req, res) => {
    try {
        const {
            classification,
            severity,
            limit = 100,
            offset = 0,
        } = req.query;

        const filter = {};
        if (classification) filter.classification = classification;
        if (severity) filter.severity = severity;

        const logs = await TrafficLog.find(filter)
            .sort({ timestamp: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .lean();

        const total = await TrafficLog.countDocuments(filter);

        res.json({ logs, total, limit: parseInt(limit), offset: parseInt(offset) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/traffic
 * Clear all traffic logs.
 */
router.delete('/', async (req, res) => {
    try {
        await TrafficLog.deleteMany({});
        res.json({ success: true, message: 'All traffic logs cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
