/**
 * DB Writer – Data Pump (Write-Behind)
 * BUOI_9 – Space-Based Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 * Lắng nghe RabbitMQ:
 *   product.created → INSERT vào MariaDB LOCAL
 *   product.deleted → DELETE khỏi MariaDB LOCAL
 *
 * Đây là COMPONENT DUY NHẤT ghi vào DB tại runtime.
 * Tách biệt hoàn toàn khỏi hot path → không block API response.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const amqp = require("amqplib");
const mysql = require("mysql2/promise");

const EXCHANGE = "buoi9";
const QUEUE_CREATED = "product.created";
const QUEUE_DELETED = "product.deleted";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── MariaDB pool ──────────────────────────────────────────────────────────────
async function createPool(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const pool = mysql.createPool({
        host: process.env.DB_HOST || "host.docker.internal",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "buoi9_sba",
        waitForConnections: true,
        connectionLimit: 5,
      });
      const c = await pool.getConnection();
      await c.query("SELECT 1");
      c.release();
      console.log(`✅  [DB-Writer] MariaDB connected → ${process.env.DB_HOST || "host.docker.internal"}`);
      return pool;
    } catch (err) {
      console.log(`⏳  [DB-Writer] Waiting MariaDB (${i + 1}/${retries}): ${err.message}`);
      await sleep(3000);
    }
  }
  throw new Error("Cannot connect to MariaDB");
}

// ── Message Handlers ──────────────────────────────────────────────────────────
async function onProductCreated(db, payload) {
  const { id, name, description, price, category, stock, created_at } = payload;
  await db.execute(
    `INSERT INTO products (id, name, description, price, category, stock, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name=VALUES(name), description=VALUES(description),
       price=VALUES(price), category=VALUES(category), stock=VALUES(stock)`,
    [id, name, description || "", price, category || "", stock || 0, new Date(created_at)]
  );
  console.log(`📝  [DB-Writer] INSERT product id=${id} (${name}) → MariaDB ✅`);
}

async function onProductDeleted(db, payload) {
  const { id } = payload;
  const [result] = await db.execute(
    `DELETE FROM products WHERE id = ?`,
    [id]
  );
  console.log(`🗑️   [DB-Writer] DELETE product id=${id} → MariaDB ✅ (affected: ${result.affectedRows})`);
}

// ── RabbitMQ Consumer ─────────────────────────────────────────────────────────
async function startConsumer(db, retries = 30) {
  const url = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(url);
      const ch = await conn.createChannel();
      ch.prefetch(1);

      await ch.assertExchange(EXCHANGE, "direct", { durable: true });
      await ch.assertQueue(QUEUE_CREATED, { durable: true });
      await ch.assertQueue(QUEUE_DELETED, { durable: true });
      await ch.bindQueue(QUEUE_CREATED, EXCHANGE, QUEUE_CREATED);
      await ch.bindQueue(QUEUE_DELETED, EXCHANGE, QUEUE_DELETED);

      console.log("✅  [DB-Writer] RabbitMQ connected, listening…");

      ch.consume(QUEUE_CREATED, async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
          console.log(`📨  [DB-Writer] product.created: id=${payload.id}`);
          await onProductCreated(db, payload);
          ch.ack(msg);
        } catch (err) {
          console.error("❌  product.created error:", err.message);
          // requeue=true → thử lại sau (ví dụ bảng chưa tồn tại)
          ch.nack(msg, false, true);
          await sleep(5000); // chờ 5s trước khi nhận message tiếp
        }
      });

      ch.consume(QUEUE_DELETED, async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
          console.log(`📨  [DB-Writer] product.deleted: id=${payload.id}`);
          await onProductDeleted(db, payload);
          ch.ack(msg);
        } catch (err) {
          console.error("❌  product.deleted error:", err.message);
          // requeue=true → thử lại sau
          ch.nack(msg, false, true);
          await sleep(5000);
        }
      });

      conn.on("close", () => {
        console.warn("⚠️   [DB-Writer] RabbitMQ closed, reconnecting…");
        setTimeout(() => startConsumer(db), 5000);
      });

      return;
    } catch (err) {
      console.log(`⏳  [DB-Writer] Waiting RabbitMQ (${i + 1}/${retries}): ${err.message}`);
      await sleep(3000);
    }
  }
  throw new Error("Cannot connect to RabbitMQ");
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀  DB Writer (Data Pump) starting…");
  const db = await createPool();
  await startConsumer(db);
  console.log("✅  DB Writer ready – consuming messages from RabbitMQ");
}

main().catch((err) => {
  console.error("❌  Fatal:", err.message);
  process.exit(1);
});
