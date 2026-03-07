require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { createProxy } = require('./proxy/proxyMiddleware');
const { refreshCache } = require('./utils/pathMatcher');

const uploadRoutes = require('./routes/upload');
const trafficRoutes = require('./routes/traffic');
const statsRoutes = require('./routes/stats');

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

async function startServer() {
    // Connect to MongoDB
    await connectDB();

    // Refresh path matcher cache on startup
    await refreshCache();

    const app = express();
    const server = http.createServer(app);

    // Socket.io
    const io = new Server(server, {
        cors: {
            origin: CLIENT_ORIGIN,
            methods: ['GET', 'POST'],
        },
    });

    // Store io instance for use in routes
    app.set('io', io);

    // Middleware
    app.use(cors({ origin: CLIENT_ORIGIN }));
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // API Routes
    app.use('/api/upload', uploadRoutes);
    app.use('/api/traffic', trafficRoutes);
    app.use('/api/stats', statsRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Proxy fetch — used by the CMD modal to fetch API responses
    app.get('/api/proxy-fetch', async (req, res) => {
        const { method = 'GET', path: reqPath } = req.query;
        if (!reqPath) return res.status(400).json({ error: 'path is required' });
        const target = process.env.PROXY_TARGET || 'http://localhost:4000';
        try {
            const url = `${target}${reqPath}`;
            const response = await fetch(url, { method });
            const contentType = response.headers.get('content-type') || '';
            let body;
            if (contentType.includes('json')) {
                body = await response.json();
                return res.json(body);
            }
            body = await response.text();
            res.type('text').send(body);
        } catch (err) {
            res.status(502).json({ error: `Failed to reach proxy target: ${err.message}` });
        }
    });

    // Proxy middleware (must be last — catches all /proxy/* requests)
    app.use('/proxy', createProxy(io));

    // Socket.io connection
    io.on('connection', (socket) => {
        console.log(`🔌 Dashboard connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`🔌 Dashboard disconnected: ${socket.id}`);
        });
    });

    server.listen(PORT, () => {
        console.log('');
        console.log('╔══════════════════════════════════════════════╗');
        console.log('║         🕵️  ShadowCatch API Hunter          ║');
        console.log('╠══════════════════════════════════════════════╣');
        console.log(`║  Server:    http://localhost:${PORT}             ║`);
        console.log(`║  Proxy:     http://localhost:${PORT}/proxy/*     ║`);
        console.log(`║  Dashboard: ${CLIENT_ORIGIN}            ║`);
        console.log('╚══════════════════════════════════════════════╝');
        console.log('');
    });
}

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
