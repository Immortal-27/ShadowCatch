const mongoose = require('mongoose');

const allowedRouteSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        required: true,
        uppercase: true,
    },
    summary: {
        type: String,
        default: '',
    },
    parameters: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
    },
    specName: {
        type: String,
        default: 'default',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

allowedRouteSchema.index({ path: 1, method: 1 }, { unique: true });

module.exports = mongoose.model('AllowedRoute', allowedRouteSchema);
