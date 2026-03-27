const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const USER_SERVICE = process.env.USER_SERVICE_URL;
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL;
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL;

// ==================== MIDDLEWARE ====================
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ==================== USER ROUTES (Proxy) ====================
app.get('/api/users', async (req, res) => {
    try {
        const response = await axios.get(`${USER_SERVICE}/api/users`);
        res.json(response.data);
    } catch (err) {
        console.error('Error calling User Service:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const response = await axios.get(`${USER_SERVICE}/api/users/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        console.error('Error calling User Service:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const response = await axios.post(`${USER_SERVICE}/api/users`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        console.error('Error calling User Service:', err.message);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// ==================== PRODUCT ROUTES (Proxy) ====================
app.get('/api/products', async (req, res) => {
    try {
        const response = await axios.get(`${PRODUCT_SERVICE}/api/products`);
        res.json(response.data);
    } catch (err) {
        console.error('Error calling Product Service:', err.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const response = await axios.get(`${PRODUCT_SERVICE}/api/products/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        console.error('Error calling Product Service:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const response = await axios.post(`${PRODUCT_SERVICE}/api/products`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        console.error('Error calling Product Service:', err.message);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const response = await axios.put(`${PRODUCT_SERVICE}/api/products/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('Error calling Product Service:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to update product' });
    }
});

// ==================== ORDER ROUTES (Proxy) ====================
app.get('/api/orders', async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_SERVICE}/api/orders`);
        res.json(response.data);
    } catch (err) {
        console.error('Error calling Order Service:', err.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_SERVICE}/api/orders/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        console.error('Error calling Order Service:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to fetch order' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const response = await axios.post(`${ORDER_SERVICE}/api/orders`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        console.error('Error calling Order Service:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to create order' });
    }
});

// ==================== SERVICE HEALTH ====================
app.get('/health', async (req, res) => {
    try {
        const userHealth = await axios.get(`${USER_SERVICE}/health`).catch(() => ({ data: { status: 'down' } }));
        const productHealth = await axios.get(`${PRODUCT_SERVICE}/health`).catch(() => ({ data: { status: 'down' } }));
        const orderHealth = await axios.get(`${ORDER_SERVICE}/health`).catch(() => ({ data: { status: 'down' } }));

        res.json({
            gateway: 'running',
            services: {
                user: userHealth.data,
                product: productHealth.data,
                order: orderHealth.data,
            },
            timestamp: new Date(),
        });
    } catch (err) {
        res.status(500).json({ error: 'Health check failed' });
    }
});

// ==================== INFO ====================
app.get('/info', (req, res) => {
    res.json({
        name: 'API Gateway',
        version: '1.0.0',
        services: {
            user: USER_SERVICE,
            product: PRODUCT_SERVICE,
            order: ORDER_SERVICE,
        },
        routes: [
            'GET /api/users',
            'GET /api/users/:id',
            'POST /api/users',
            'GET /api/products',
            'GET /api/products/:id',
            'POST /api/products',
            'PUT /api/products/:id',
            'GET /api/orders',
            'GET /api/orders/:id',
            'POST /api/orders',
        ],
    });
});

app.listen(PORT, () => {
    console.log(`\n🌐 API Gateway running on http://localhost:${PORT}`);
    console.log(`\n📡 Service Configuration:`);
    console.log(`   - User Service:    ${USER_SERVICE}`);
    console.log(`   - Product Service: ${PRODUCT_SERVICE}`);
    console.log(`   - Order Service:   ${ORDER_SERVICE}`);
    console.log(`\n📊 Check /health for service status`);
    console.log(`📖 Check /info for endpoint documentation\n`);
});
