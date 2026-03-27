const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const SERVICE_NAME = process.env.SERVICE_NAME;
const PORT = process.env.PORT || 3003;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;

// ==================== ORDER ROUTES ====================
app.get('/api/orders', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, u.username, p.name, p.price 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN products p ON o.product_id = p.id`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT o.*, u.username, p.name, p.price 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

app.post('/api/orders', async (req, res) => {
    const { user_id, product_id, quantity } = req.body;
    try {
        // Verify user exists using User Service
        try {
            await axios.get(`${USER_SERVICE_URL}/api/users/${user_id}`);
        } catch (err) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get product price using Product Service
        let product;
        try {
            const productRes = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${product_id}`);
            product = productRes.data;
        } catch (err) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const total_price = product.price * quantity;

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
    res.json({
        status: 'Order Service running',
        service: SERVICE_NAME,
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`📋 ${SERVICE_NAME} running on http://localhost:${PORT}`);
    console.log('💳 Only Order endpoints on this service');
    console.log(`📞 Calls User Service at ${USER_SERVICE_URL}`);
    console.log(`📞 Calls Product Service at ${PRODUCT_SERVICE_URL}`);
});
