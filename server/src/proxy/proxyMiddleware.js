const { createProxyMiddleware } = require('http-proxy-middleware');
const { analyzeRequest } = require('../services/detectionEngine');
const TrafficLog = require('../models/TrafficLog');

/**
 * Create the reverse proxy middleware that intercepts,
 * analyzes, and forwards traffic.
 */
function createProxy(io) {
    const target = process.env.PROXY_TARGET || 'http://localhost:4000';

    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            '^/proxy': '', // strip /proxy prefix before forwarding
        },
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
                    message: `Could not reach target server at ${target}`,
                });
            },
        },
    });
}

module.exports = { createProxy };
