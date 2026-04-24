/**
 * Seeder – MariaDB LOCAL → Redis Data Grid
 * Chạy 1 lần lúc khởi động. Sau đó runtime chỉ dùng Redis.
 */
const mysql = require("mysql2/promise");
const Redis = require("ioredis");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForMySQL(cfg, retries = 15) {
  for (let i = 0; i < retries; i++) {
    try {
      const c = await mysql.createConnection(cfg);
      await c.query("SELECT 1");
      await c.end();
      console.log("✅  MySQL ready");
      return;
    } catch {
      console.log(`⏳  Waiting MySQL (${i + 1}/${retries})…`);
      await sleep(3000);
    }
  }
  throw new Error("MySQL not reachable");
}

async function main() {
  const dbCfg = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "buoi9_sba",
  };

  const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    retryStrategy: (t) => Math.min(t * 100, 3000),
  });

  await redis.ping();
  console.log("✅  Redis ready");
  await waitForMySQL(dbCfg);

  const db = await mysql.createConnection(dbCfg);
  const [products] = await db.query("SELECT * FROM products");

  const pipe = redis.pipeline();

  // Xóa index cũ trước khi seed lại
  pipe.del("products:index");

  for (const p of products) {
    pipe.hset(`products:${p.id}`, {
      id: String(p.id),
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      category: p.category || "",
      stock: String(p.stock),
      created_at: String(p.created_at),
    });
    pipe.sadd("products:index", String(p.id));
  }

  await pipe.exec();
  console.log(`✅  Seeded ${products.length} products → Redis`);
  console.log("🚀  Redis Data Grid ready");

  await db.end();
  await redis.quit();
}

main().catch((err) => {
  console.error("❌  Seeder failed:", err.message);
  process.exit(1);
});
