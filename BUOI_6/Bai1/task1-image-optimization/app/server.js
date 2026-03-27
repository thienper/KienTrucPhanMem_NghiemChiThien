const express = require('express');
const app = express();
const PORT = 3000;

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Info endpoint
app.get('/info', (req, res) => {
    res.json({
        app: 'Docker Image Optimization Demo',
        nodejs_version: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
    });
});

// Hello endpoint
app.get('/', (req, res) => {
    res.send(`
    <h1>Welcome to Docker Image Optimization Demo</h1>
    <ul>
      <li><a href="/health">/health</a> - Health check</li>
      <li><a href="/info">/info</a> - Application info</li>
    </ul>
  `);
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
