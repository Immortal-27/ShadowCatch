const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.json());

// ─── In-Memory Data ───────────────────────────────────
const users = [
    { id: 1, name: 'Swarnabha Bhattacharjee', email: 'swarnabha.vis27@gmail.com', role: 'admin' },
    { id: 2, name: 'Milon Paul', email: 'milonpaul159@gmail.com', role: 'admin' },
    { id: 3, name: 'Abhimanyu Sengupta', email: 'visabhimanyusengupta@gmail.com', role: 'admin' },
    { id: 4, name: 'Anushka Dey', email: 'anuskadey18511@gmail.com', role: 'admin' },
    { id: 5, name: 'Anushka Dey', email: 'anuskadey18511@gmail.com', role: 'admin' },
    { id: 6, name: 'Anushka Dey', email: 'anuskadey18511@gmail.com', role: 'admin' },
    { id: 7, name: 'Anushka Dey', email: 'anuskadey18511@gmail.com', role: 'admin' },
    { id: 8, name: 'Anushka Dey', email: 'anuskadey18511@gmail.com', role: 'admin' },

];

let nextId = 4;

// ═══════════════════════════════════════════════════════
// DOCUMENTED ENDPOINTS (These are in the Swagger spec)
// ═══════════════════════════════════════════════════════

// GET /api/users — List all users
app.get('/api/users', (req, res) => {
    res.json({ users, count: users.length });
});

// GET /api/users/:id — Get user by ID
app.get('/api/users/:id', (req, res) => {
    const user = users.find((u) => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

// POST /api/users — Create a new user
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
    const newUser = { id: nextId++, name, email, role: 'user' };
    users.push(newUser);
    res.status(201).json(newUser);
});

// DELETE /api/users/:id — Delete a user by ID
app.delete('/api/users/:id', (req, res) => {
    const idx = users.findIndex((u) => u.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    const deleted = users.splice(idx, 1)[0];
    res.json({ message: 'User deleted', user: deleted });
});

// GET /api/health — Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// ═══════════════════════════════════════════════════════
// 🚨 SHADOW / ZOMBIE ENDPOINTS (NOT in the Swagger spec)
// These are the "forgotten" endpoints that ShadowCatch
// should detect and flag as threats.
// ═══════════════════════════════════════════════════════

// 🚨 Shadow: Admin backdoor
app.get('/api/admin/secret_backdoor', (req, res) => {
    res.json({
        message: '🚨 SECRET ADMIN BACKDOOR - Full system access granted',
        allUsers: users,
        systemInfo: { node: process.version, platform: process.platform },
    });
});

// 🚨 Shadow: Nuclear option
app.delete('/api/admin/nuke', (req, res) => {
    res.json({ message: '💣 NUKE ENDPOINT - Would delete all data', simulated: true });
});

// 🚨 Shadow: Debug endpoint
app.post('/api/internal/debug', (req, res) => {
    res.json({
        message: '🔧 DEBUG ENDPOINT - Internal diagnostics',
        env: Object.keys(process.env).slice(0, 5),
        memory: process.memoryUsage(),
    });
});

// 🚨 Shadow: Legacy endpoint
app.get('/api/v1/legacy/export', (req, res) => {
    res.json({
        message: '📦 LEGACY EXPORT - Old data export endpoint',
        data: users,
    });
});

// 🚨 Shadow: Unprotected config endpoint
app.get('/api/config', (req, res) => {
    res.json({
        message: '⚙️ CONFIG ENDPOINT - Exposes configuration',
        database: 'mongodb://localhost:27017/production',
        apiKeys: { stripe: 'sk_live_FAKE_KEY', sendgrid: 'SG.FAKE_KEY' },
    });
});

app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║       🎯 Dummy Target API (for demo)        ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Running on http://localhost:${PORT}             ║`);
    console.log('║                                              ║');
    console.log('║  Documented:                                 ║');
    console.log('║    GET    /api/users                         ║');
    console.log('║    GET    /api/users/:id                     ║');
    console.log('║    POST   /api/users                         ║');
    console.log('║    GET    /api/health                        ║');
    console.log('║                                              ║');
    console.log('║  🚨 Shadow (undocumented):                   ║');
    console.log('║    GET    /api/admin/secret_backdoor         ║');
    console.log('║    DELETE /api/admin/nuke                    ║');
    console.log('║    POST   /api/internal/debug                ║');
    console.log('║    GET    /api/v1/legacy/export              ║');
    console.log('║    GET    /api/config                        ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
});
