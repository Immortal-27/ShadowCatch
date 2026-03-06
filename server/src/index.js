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
