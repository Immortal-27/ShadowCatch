const express = require('express');
const TrafficLog = require('../models/TrafficLog');
const AllowedRoute = require('../models/AllowedRoute');

const router = express.Router();

/**
 * GET /api/stats
 * Dashboard statistics.
 */
router.get('/', async (req, res) => {
    try {
        const [
            totalRequests,
            shadowCount,
            methodMismatchCount,
            dataLeakCount,
            validCount,
            allowedRouteCount,
            recentAlerts,
            severityBreakdown,
        ] = await Promise.all([
            TrafficLog.countDocuments(),
            TrafficLog.countDocuments({ classification: 'shadow' }),
            TrafficLog.countDocuments({ classification: 'method-mismatch' }),
            TrafficLog.countDocuments({ classification: 'data-leak' }),
            TrafficLog.countDocuments({ classification: 'valid' }),
            AllowedRoute.countDocuments(),
            TrafficLog.find({ classification: { $ne: 'valid' } })
                .sort({ timestamp: -1 })
                .limit(5)
                .lean(),
            TrafficLog.aggregate([
                { $match: { classification: { $ne: 'valid' } } },
                { $group: { _id: '$severity', count: { $sum: 1 } } },
            ]),
        ]);

        // Calculate threat level (0-100)
        const threatScore = totalRequests > 0
            ? Math.min(100, Math.round(((shadowCount * 3 + methodMismatchCount * 2 + dataLeakCount * 5) / totalRequests) * 100))
            : 0;

        res.json({
            totalRequests,
            validCount,
            shadowCount,
            methodMismatchCount,
            dataLeakCount,
            allowedRouteCount,
            threatScore,
            recentAlerts,
            severityBreakdown: severityBreakdown.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
