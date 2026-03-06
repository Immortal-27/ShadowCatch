const { createProxyMiddleware } = require('http-proxy-middleware');
const { analyzeRequest } = require('../services/detectionEngine');
const TrafficLog = require('../models/TrafficLog');

/**
 * Helper: build a traffic log entry from analysis results and save/emit it.
 */
function logAndEmit(io, req, fakeReq, analysis) {
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

        if (analysis.classification !== 'valid' && analysis.classification !== 'unreachable') {
            io.emit('shadow-alert', {
                ...logEntry,
                alertTime: new Date().toISOString(),
            });
        }
    }
}

/**
 * Create the reverse proxy middleware that intercepts,
 * analyzes, and forwards traffic.
 *
 * Analysis now happens AFTER the target responds (proxyRes),
 * so when the target API is offline no false-positive faults
 * are recorded — only an 'unreachable' classification.
 */
function createProxy(io) {
    const target = process.env.PROXY_TARGET || 'http://localhost:4000';

    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            '^/proxy': '', // strip /proxy prefix before forwarding
        },
        selfHandleResponse: true, // we manually send the response in proxyRes

        on: {
            proxyReq: (proxyReq, req, res) => {
                // Only stash cleaned request info for later analysis
                const cleanPath = req.originalUrl.replace(/^\/proxy/, '') || '/';
                req._shadowReq = {
                    path: cleanPath.split('?')[0],
                    method: req.method,
                    query: req.query || {},
                };
            },

            proxyRes: (proxyRes, req, res) => {
                // Target responded — NOW run the analysis
                const fakeReq = req._shadowReq;
                if (fakeReq) {
                    const analysis = analyzeRequest(fakeReq);
                    logAndEmit(io, req, fakeReq, analysis);
                }

                // Forward the target's response back to the client
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            },

            error: (err, req, res) => {
                console.error('Proxy error:', err.message);

                // Log as 'unreachable' instead of a false fault
                const fakeReq = req._shadowReq;
                if (fakeReq) {
                    const analysis = {
                        classification: 'unreachable',
                        severity: 'none',
                        severityScore: 0,
                        matchedRoute: null,
                        details: `Target API unreachable: ${err.message}`,
                    };
                    logAndEmit(io, req, fakeReq, analysis);
                }

                if (!res.headersSent) {
                    res.status(502).json({
                        error: 'Proxy error',
                        message: `Could not reach target server at ${target}`,
                    });
                }
            },
        },
    });
}

module.exports = { createProxy };
