const path = require('path');
const express = require('express');
const createKernel = require('./src/core/kernel');

const app = express();

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const kernel = createKernel({
  app,
  dataFilePath: path.join(__dirname, 'data.json'),
});

kernel.boot();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`CMS backend is running on http://localhost:${PORT}`);
});
