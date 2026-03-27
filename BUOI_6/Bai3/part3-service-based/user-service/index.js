const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const SERVICE_NAME = process.env.SERVICE_NAME;
const PORT = process.env.PORT || 5001;

// ==================== USER ROUTES ====================
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, created_at FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [username, email, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({
        status: 'User Service running',
        service: SERVICE_NAME,
        port: PORT,
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`👤 ${SERVICE_NAME} running on http://localhost:${PORT}`);
});
