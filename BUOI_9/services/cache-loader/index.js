/**
 * Cache Loader – On-Demand Cache Warming
 * BUOI_9 – Space-Based Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 * Giải quyết bài toán: "Redis trống nhưng MariaDB còn data"
 *
 * Cách hoạt động:
 *   1. Product Service gặp cache miss → publish message → RabbitMQ queue "cache.miss"
 *   2. Cache Loader nhận message → đọc MariaDB → ghi vào Redis
 *   3. Request tiếp theo sẽ tìm thấy trong Redis
 *
 * Message format (queue: cache.miss):
 *   { type: "product", productId: 1 }   → load 1 sản phẩm
 *   { type: "all" }                       → load toàn bộ products
 *
 * HTTP Admin API (port 3010):
 *   POST /reload          → trigger reload toàn bộ DB → Redis
 *   POST /reload/:id      → trigger reload 1 sản phẩm
 *   GET  /health
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require("express");
const amqp = require("amqplib");
const Redis = require("ioredis");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3010;
app.use(express.json());

const EXCHANGE = "buoi9";
const QUEUE_CACHE_MISS = "cache.miss";

// ── Redis ─────────────────────────────────────────────────────────────────────
const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (t) => Math.min(t * 100, 3000),
});
redis.on("connect", () => console.log("✅  [CacheLoader] Redis connected"));
redis.on("error", (e) => console.error("❌  [CacheLoader] Redis:", e.message));

// ── MariaDB ───────────────────────────────────────────────────────────────────
let db = null;

async function connectDb(retries = 20) {
  const host = process.env.DB_HOST || "host.docker.internal";
  for (let i = 0; i < retries; i++) {
    try {
      const pool = mysql.createPool({
        host,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "buoi9_sba",
        waitForConnections: true,
        connectionLimit: 3,
      });
      const c = await pool.getConnection();
      await c.query("SELECT 1");
      c.release();
      console.log(`✅  [CacheLoader] MariaDB connected → ${host}`);
      return pool;
    } catch (err) {
      console.log(`⏳  [CacheLoader] Waiting MariaDB (${i + 1}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("Cannot connect to MariaDB");
}

// ── Core: Load từ MariaDB → Redis ─────────────────────────────────────────────
async function loadProductToRedis(row) {
  await redis.hset(`products:${row.id}`, {
    id: String(row.id),
    name: row.name,
    description: row.description || "",
    price: String(row.price),
    category: row.category || "",
    stock: String(row.stock),
    created_at: String(row.created_at),
  });
  await redis.sadd("products:index", String(row.id));
  console.log(`📦  [CacheLoader] Loaded product id=${row.id} (${row.name}) → Redis`);
}

async function loadOneProduct(productId) {
  const [rows] = await db.execute(
    "SELECT * FROM products WHERE id = ?",
    [productId]
  );
  if (!rows.length) {
    console.warn(`⚠️   [CacheLoader] product id=${productId} not found in MariaDB`);
    return false;
  }
  await loadProductToRedis(rows[0]);
  return true;
}

async function loadAllProducts() {
  const [rows] = await db.query("SELECT * FROM products");
  if (!rows.length) {
    console.warn("⚠️   [CacheLoader] No products in MariaDB");
    return 0;
  }

  // Xóa index cũ trước khi load lại
  await redis.del("products:index");

  for (const row of rows) {
    await loadProductToRedis(row);
  }
  console.log(`✅  [CacheLoader] Loaded ${rows.length} products → Redis`);
  return rows.length;
}

// ── RabbitMQ Consumer ─────────────────────────────────────────────────────────
async function startConsumer(retries = 30) {
  const url = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(url);
      const ch = await conn.createChannel();
      ch.prefetch(1);

      await ch.assertExchange(EXCHANGE, "direct", { durable: true });
      await ch.assertQueue(QUEUE_CACHE_MISS, { durable: true });
      await ch.bindQueue(QUEUE_CACHE_MISS, EXCHANGE, QUEUE_CACHE_MISS);

      console.log("✅  [CacheLoader] RabbitMQ connected, listening on cache.miss…");

      ch.consume(QUEUE_CACHE_MISS, async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
          console.log(`📨  [CacheLoader] cache.miss received:`, payload);

          if (payload.type === "all") {
            await loadAllProducts();
          } else if (payload.type === "product" && payload.productId) {
            await loadOneProduct(payload.productId);
          } else {
            console.warn("⚠️   [CacheLoader] Unknown message format:", payload);
          }

          ch.ack(msg);
        } catch (err) {
          console.error("❌  [CacheLoader] Error handling cache.miss:", err.message);
          ch.nack(msg, false, false);
        }
      });

      conn.on("close", () => {
        console.warn("⚠️   [CacheLoader] RabbitMQ closed, reconnecting…");
        setTimeout(() => startConsumer(), 5000);
      });

      return;
    } catch (err) {
      console.log(`⏳  [CacheLoader] Waiting RabbitMQ (${i + 1}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("Cannot connect to RabbitMQ");
}

// ── HTTP Admin Endpoints (cho Postman manual trigger) ─────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "cache-loader" })
);

// POST /reload → load toàn bộ products từ MariaDB → Redis
app.post("/reload", async (_req, res) => {
  try {
    const count = await loadAllProducts();
    res.json({
      message: `Cache reloaded: ${count} products loaded from MariaDB → Redis`,
      count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /reload/:id → load 1 product cụ thể từ MariaDB → Redis
app.post("/reload/:id", async (req, res) => {
  try {
    const found = await loadOneProduct(req.params.id);
    if (!found) {
      return res.status(404).json({ error: `Product id=${req.params.id} not found in MariaDB` });
    }
    res.json({
      message: `Product id=${req.params.id} loaded from MariaDB → Redis`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀  Cache Loader starting…");
  db = await connectDb();
  await startConsumer();
  app.listen(PORT, () => {
    console.log(`✅  Cache Loader HTTP admin on port ${PORT}`);
    console.log(`   POST /reload       – reload all from MariaDB → Redis`);
    console.log(`   POST /reload/:id   – reload one product`);
  });
}

main().catch((err) => {
  console.error("❌  Fatal:", err.message);
  process.exit(1);
});
