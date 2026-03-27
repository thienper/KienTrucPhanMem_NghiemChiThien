const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

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

app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// ==================== PRODUCT ROUTES ====================
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    const { name, description, price, stock } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, price, stock]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// ==================== ORDER ROUTES ====================
app.get('/api/orders', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, u.username, p.name, p.price 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN products p ON o.product_id = p.id`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.post('/api/orders', async (req, res) => {
    const { user_id, product_id, quantity } = req.body;
    try {
        // Get product price
        const product = await pool.query('SELECT price FROM products WHERE id = $1', [product_id]);
        const total_price = product.rows[0].price * quantity;

        // Create order
        const result = await pool.query(
            'INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, product_id, quantity, total_price, 'pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({ status: 'Monolith running', timestamp: new Date() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Monolith Server running on http://localhost:${PORT}`);
    console.log('📦 All features (User, Product, Order) in ONE application');
});
