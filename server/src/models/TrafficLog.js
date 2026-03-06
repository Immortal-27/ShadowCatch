const mongoose = require('mongoose');

const trafficLogSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        required: true,
        uppercase: true,
    },
    headers: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    query: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    body: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    ip: {
        type: String,
        default: 'unknown',
    },
    classification: {
        type: String,
        enum: ['valid', 'shadow', 'method-mismatch', 'data-leak'],
        default: 'valid',
    },
    severity: {
        type: String,
        enum: ['none', 'low', 'medium', 'high', 'critical'],
        default: 'none',
    },
    severityScore: {
        type: Number,
        default: 0,
    },
    matchedRoute: {
        type: String,
        default: null,
    },
    details: {
        type: String,
        default: '',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

trafficLogSchema.index({ timestamp: -1 });
trafficLogSchema.index({ classification: 1 });

module.exports = mongoose.model('TrafficLog', trafficLogSchema);
