/**
 * API Gateway – BUOI_9 SBA
 * Điểm vào duy nhất, route tất cả request đến microservices.
 */
const express = require("express");
const proxy = require("express-http-proxy");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 8080;

const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || "http://product-service:3001";
const CACHE_LOADER_URL = process.env.CACHE_LOADER_URL || "http://cache-loader:3010";

app.use(cors());
app.use(morgan("dev"));

// Health check gateway
app.get("/health", (_req, res) =>
  res.json({
    status: "ok",
    gateway: "api-gateway",
    services: { product: PRODUCT_URL, cacheLoader: CACHE_LOADER_URL },
  })
);

// Route /api/products → product-service
app.use(
  "/api/products",
  proxy(PRODUCT_URL, {
    proxyReqPathResolver: (req) => `/products${req.url === "/" ? "" : req.url}`,
  })
);

// Route /api/cache → cache-loader (admin: reload cache từ MariaDB)
// POST /api/cache/reload       → load all
// POST /api/cache/reload/:id   → load one product
app.use(
  "/api/cache",
  proxy(CACHE_LOADER_URL, {
    proxyReqPathResolver: (req) => `/reload${req.url === "/" ? "" : req.url}`,
  })
);

app.listen(PORT, () => {
  console.log(`🚀  API Gateway running on port ${PORT}`);
  console.log(`   /api/products → ${PRODUCT_URL}`);
});
