/**
 * PU1 – Product Service
 * Space-Based Architecture – BUOI_9
 * ─────────────────────────────────────────────────────────────────────────────
 * Tất cả READS từ Redis Data Grid (không đọc DB runtime).
 * WRITES: ghi Redis ngay + publish RabbitMQ → DB Writer sẽ persist vào MariaDB.
 *
 * API:
 *   GET    /products          – lấy tất cả sản phẩm từ Redis
 *   GET    /products/:id      – lấy 1 sản phẩm từ Redis
 *   POST   /products          – thêm sản phẩm → Redis + RabbitMQ
 *   DELETE /products/:id      – xóa sản phẩm → Redis + RabbitMQ
 *   GET    /health
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const Redis = require("ioredis");
const amqp = require("amqplib");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Redis Data Grid ───────────────────────────────────────────────────────────
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (t) => Math.min(t * 100, 3000),
});
redis.on("connect", () => console.log("✅  [Product] Redis connected"));
redis.on("error", (e) => console.error("❌  [Product] Redis:", e.message));

// ── RabbitMQ Publisher ────────────────────────────────────────────────────────
const EXCHANGE = "buoi9";
const QUEUE_CREATED = "product.created";
const QUEUE_DELETED = "product.deleted";
const QUEUE_CACHE_MISS = "cache.miss";
let rabbitChannel = null;

async function connectRabbit(retries = 20) {
  const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(url);
      const ch = await conn.createChannel();
      await ch.assertExchange(EXCHANGE, "direct", { durable: true });
      await ch.assertQueue(QUEUE_CREATED, { durable: true });
      await ch.assertQueue(QUEUE_DELETED, { durable: true });
      await ch.assertQueue(QUEUE_CACHE_MISS, { durable: true });
      await ch.bindQueue(QUEUE_CREATED, EXCHANGE, QUEUE_CREATED);
      await ch.bindQueue(QUEUE_DELETED, EXCHANGE, QUEUE_DELETED);
      await ch.bindQueue(QUEUE_CACHE_MISS, EXCHANGE, QUEUE_CACHE_MISS);
      rabbitChannel = ch;
      console.log("✅  [Product] RabbitMQ connected");
      conn.on("close", () => {
        rabbitChannel = null;
        setTimeout(() => connectRabbit(), 5000);
      });
      return;
    } catch {
      console.log(`⏳  [Product] Waiting RabbitMQ (${i + 1}/${retries})…`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.warn("⚠️   [Product] RabbitMQ unavailable");
}

function publish(routingKey, payload) {
  if (!rabbitChannel) return;
  try {
    rabbitChannel.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true, contentType: "application/json" }
    );
    console.log(`📤  Published → ${routingKey}:`, payload.id || payload.name);
  } catch (e) {
    console.error("❌  Publish error:", e.message);
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getProduct(id) {
  const data = await redis.hgetall(`products:${id}`);
  if (!data || !data.id) return null;
  return {
    id: parseInt(data.id),
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    category: data.category,
    stock: parseInt(data.stock),
    created_at: data.created_at,
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "product-service", rabbitmq: !!rabbitChannel })
);

// GET tất cả sản phẩm từ Redis
app.get("/products", async (_req, res) => {
  try {
    const ids = await redis.smembers("products:index");
    if (!ids.length) return res.json([]);
    const products = (await Promise.all(ids.map(getProduct)))
      .filter(Boolean)
      .sort((a, b) => a.id - b.id);
    res.json({ source: "redis", count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET 1 sản phẩm từ Redis
// Nếu không tìm thấy trong Redis → publish cache.miss → Cache Loader sẽ load từ MariaDB
app.get("/products/:id", async (req, res) => {
  try {
    const product = await getProduct(req.params.id);
    if (!product) {
      // Trigger cache loading từ MariaDB qua RabbitMQ
      publish(QUEUE_CACHE_MISS, { type: "product", productId: parseInt(req.params.id) });
      return res.status(404).json({
        error: "Product not found in cache",
        hint: "Cache miss triggered – Cache Loader đang load từ MariaDB. Thử lại sau 1-2 giây.",
        productId: parseInt(req.params.id),
      });
    }
    res.json({ source: "redis", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST thêm sản phẩm
// Body: { name, description, price, category, stock }
app.post("/products", async (req, res) => {
  try {
    const { name, description = "", price, category = "", stock = 0 } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "name và price là bắt buộc" });
    }

    // Tạo ID mới: lấy max ID hiện có + 1
    const ids = await redis.smembers("products:index");
    const newId = ids.length
      ? Math.max(...ids.map(Number)) + 1
      : 1;

    const now = new Date().toISOString();
    const product = {
      id: String(newId),
      name,
      description,
      price: String(price),
      category,
      stock: String(stock),
      created_at: now,
    };

    // 1. Ghi vào Redis Data Grid ngay
    const pipe = redis.pipeline();
    pipe.hset(`products:${newId}`, product);
    pipe.sadd("products:index", String(newId));
    await pipe.exec();

    // 2. Publish → RabbitMQ → DB Writer sẽ INSERT vào MariaDB
    publish(QUEUE_CREATED, {
      id: newId,
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      created_at: now,
    });

    res.status(201).json({
      message: "Sản phẩm đã thêm vào Redis. DB sẽ được cập nhật qua RabbitMQ.",
      product: { ...product, id: newId, price: parseFloat(price), stock: parseInt(stock) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE xóa sản phẩm
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await redis.exists(`products:${id}`);
    if (!exists) return res.status(404).json({ error: "Product not found" });

    const product = await getProduct(id);

    // 1. Xóa khỏi Redis Data Grid
    const pipe = redis.pipeline();
    pipe.del(`products:${id}`);
    pipe.srem("products:index", id);
    await pipe.exec();

    // 2. Publish → RabbitMQ → DB Writer sẽ DELETE trong MariaDB
    publish(QUEUE_DELETED, { id: parseInt(id), name: product?.name });

    res.json({
      message: "Sản phẩm đã xóa khỏi Redis. DB sẽ được cập nhật qua RabbitMQ.",
      deletedId: parseInt(id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  await connectRabbit();
  console.log(`🚀  Product Service (PU1) running on port ${PORT}`);
});
