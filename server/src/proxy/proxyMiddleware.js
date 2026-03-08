const { createProxyMiddleware } = require('http-proxy-middleware');
const { analyzeRequest } = require('../services/detectionEngine');
const TrafficLog = require('../models/TrafficLog');

/**
 * Create the reverse proxy middleware that intercepts,
 * analyzes, and forwards traffic.
 */
function createProxy(io) {
    const rawTarget = process.env.PROXY_TARGET || 'http://localhost:4000';
    const targetUrl = new URL(rawTarget);
    const basePath = targetUrl.pathname.replace(/\/$/, ''); // e.g. '/api/v3' or ''

    return createProxyMiddleware({
        target: targetUrl.origin,   // only origin, e.g. 'https://petstore3.swagger.io'
        changeOrigin: true,
        secure: false,
        pathRewrite: (path) => basePath + path, // /pet/1 → /api/v3/pet/1
        selfHandleResponse: false,

        on: {
            proxyReq: (proxyReq, req, res) => {
                // Strip the /proxy prefix for analysis
                const cleanPath = req.originalUrl.replace(/^\/proxy/, '') || '/';
                const fakeReq = {
                    path: cleanPath.split('?')[0],
                    method: req.method,
                    query: req.query || {},
                };

                // Analyze the request
                const analysis = analyzeRequest(fakeReq);

                // Build traffic log entry
                const logEntry = {
                    path: fakeReq.path,
                    method: req.method,
                    headers: {
                        'user-agent': req.headers['user-agent'],
                        'content-type': req.headers['content-type'],
                        host: req.headers['host'],
                    },
                    query: req.query || {},
                    body: req.body || {},
                    ip: req.ip || req.connection?.remoteAddress || 'unknown',
                    classification: analysis.classification,
                    severity: analysis.severity,
                    severityScore: analysis.severityScore,
                    matchedRoute: analysis.matchedRoute,
                    details: analysis.details,
                };

                // Save to DB (non-blocking)
                TrafficLog.create(logEntry).catch((err) =>
                    console.error('Failed to save traffic log:', err.message)
                );

                // Emit to connected dashboard clients
                if (io) {
                    io.emit('traffic-log', logEntry);

                    if (analysis.classification !== 'valid') {
                        io.emit('shadow-alert', {
                            ...logEntry,
                            alertTime: new Date().toISOString(),
                        });
                    }
                }
            },

            error: (err, req, res) => {
                console.error('Proxy error:', err.message);
                res.status(502).json({
                    error: 'Proxy error',
                    message: `Could not reach target server at ${rawTarget}`,
                });
            },
        },
    });
}

module.exports = { createProxy };
