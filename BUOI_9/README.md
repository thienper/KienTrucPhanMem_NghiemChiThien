# 📦 BUOI_9 – Space-Based Architecture (SBA) Backend

Hệ thống quản lý sản phẩm theo kiến trúc **Space-Based Architecture** với Redis làm Data Grid, RabbitMQ làm message broker, và MariaDB local làm persistent storage.

---

## 🏗️ Kiến trúc tổng quan

```
Postman / Client
       │
       ▼  :8080
  [API Gateway]
       │
       ├── /api/products ──────────► [Product Service :3001]  (PU1)
       │                                  │ (1) READ từ Redis
       │                                  │ (2) WRITE → Redis + publish RabbitMQ
       │                                  │ (3) Cache miss → publish cache.miss
       │
       └── /api/cache ────────────► [Cache Loader :3010]
                                         │ consumer: cache.miss
                                         └── đọc MariaDB → ghi Redis

RabbitMQ Exchange "buoi9"
  ├── queue: product.created ──► [DB Writer]  → INSERT MariaDB
  ├── queue: product.deleted ──► [DB Writer]  → DELETE MariaDB
  └── queue: cache.miss      ──► [Cache Loader] → SELECT MariaDB → Redis
```

**Nguyên tắc SBA:**
- ✅ **Tất cả READ** lấy từ **Redis** (Data Grid) – không đọc DB lúc runtime
- ✅ **WRITE** → ghi Redis ngay lập tức → publish RabbitMQ (non-blocking)
- ✅ **DB Writer** consume RabbitMQ → persist vào MariaDB (async, Write-Behind)
- ✅ **Cache Loader** xử lý cache miss → load MariaDB → Redis (on-demand)

---

## 🔑 Redis Key Design

| Key | Type | Mô tả |
|-----|------|-------|
| `products:index` | Set | Tập hợp tất cả product IDs |
| `products:{id}` | Hash | Thông tin chi tiết sản phẩm |

## 🐇 RabbitMQ Queue Design

| Queue | Publisher | Consumer | Mục đích |
|-------|-----------|----------|---------|
| `product.created` | Product Service | DB Writer | INSERT sản phẩm mới vào MariaDB |
| `product.deleted` | Product Service | DB Writer | DELETE sản phẩm khỏi MariaDB |
| `cache.miss` | Product Service | Cache Loader | Load sản phẩm từ MariaDB → Redis |

---

## 🚀 Hướng dẫn cài đặt và chạy

### Yêu cầu
- Docker Desktop >= 24.x
- Node.js >= 18
- MariaDB đang chạy local (port 3306)

---

### Bước 1 – Import database vào MariaDB local

Mở **HeidiSQL / DBeaver / MySQL Workbench**, kết nối MariaDB local rồi chạy file:

```
db\init.sql
```

File này tạo database `buoi9_sba` và insert 5 sản phẩm mẫu.

---

### Bước 2 – Kiểm tra file cấu hình seeder

Mở `seeder\.env.local`, điền đúng thông tin MariaDB local:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root        # ← đổi thành password của bạn
DB_NAME=buoi9_sba

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

### Bước 3 – Khởi động Docker (Redis + RabbitMQ + microservices)

```bash
docker compose up -d --build
```

Đợi đến khi tất cả containers healthy (khoảng 30-60 giây).

Kiểm tra containers đang chạy:
```bash
docker compose ps
```

Kết quả mong đợi:
```
NAME                  STATUS
buoi9-redis           running (healthy)
buoi9-rabbitmq        running (healthy)
buoi9-product         running
buoi9-db-writer       running
buoi9-cache-loader    running
buoi9-gateway         running
```

---

### Bước 4 – Seed data từ MariaDB → Redis

```bash
cd seeder
npm install        # chỉ cần lần đầu
npm run start:local
```

Kết quả thành công:
```
✅  Redis ready
✅  MySQL ready
✅  Seeded 5 products → Redis
🚀  Redis Data Grid ready
```

---

### Bước 5 – Sẵn sàng test Postman!

Truy cập: `http://localhost:8080`

---

## 📡 API Endpoints – Hướng dẫn Postman

### Base URL: `http://localhost:8080`

---

### 1. Health Check – Kiểm tra gateway

```
GET /health
```

**Kết quả:**
```json
{
  "status": "ok",
  "gateway": "api-gateway",
  "services": {
    "product": "http://product-service:3001",
    "cacheLoader": "http://cache-loader:3010"
  }
}
```

---

### 2. Lấy tất cả sản phẩm

```
GET /api/products
```

**Headers:** không cần

**Kết quả thành công (200):**
```json
{
  "source": "redis",
  "count": 5,
  "products": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "description": "Apple flagship 2024",
      "price": 29990000,
      "category": "smartphone",
      "stock": 50,
      "created_at": "2026-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

> **Lưu ý:** `"source": "redis"` xác nhận data lấy từ Redis, không phải DB.

---

### 3. Lấy 1 sản phẩm theo ID

```
GET /api/products/:id
```

**Ví dụ:** `GET /api/products/1`

**Kết quả thành công (200):**
```json
{
  "source": "redis",
  "product": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "price": 29990000,
    "category": "smartphone",
    "stock": 50
  }
}
```

**Kết quả khi cache miss (404):**
```json
{
  "error": "Product not found in cache",
  "hint": "Cache miss triggered – Cache Loader đang load từ MariaDB. Thử lại sau 1-2 giây.",
  "productId": 99
}
```

> Khi nhận 404 này → **Cache Loader** tự động load sản phẩm từ MariaDB vào Redis. Gọi lại sau 1-2 giây!

---

### 4. Thêm sản phẩm mới

```
POST /api/products
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Samsung Galaxy S24",
  "description": "Android flagship 2024",
  "price": 25990000,
  "category": "smartphone",
  "stock": 30
}
```

> `description`, `category`, `stock` là tùy chọn. Chỉ `name` và `price` là bắt buộc.

**Kết quả thành công (201):**
```json
{
  "message": "Sản phẩm đã thêm vào Redis. DB sẽ được cập nhật qua RabbitMQ.",
  "product": {
    "id": 6,
    "name": "Samsung Galaxy S24",
    "description": "Android flagship 2024",
    "price": 25990000,
    "category": "smartphone",
    "stock": 30
  }
}
```

**Điều gì xảy ra phía sau:**
1. Sản phẩm ghi vào **Redis** ngay lập tức
2. Message `product.created` publish lên **RabbitMQ**
3. **DB Writer** consume → INSERT vào **MariaDB** (async)

---

### 5. Xóa sản phẩm

```
DELETE /api/products/:id
```

**Ví dụ:** `DELETE /api/products/1`

**Kết quả thành công (200):**
```json
{
  "message": "Sản phẩm đã xóa khỏi Redis. DB sẽ được cập nhật qua RabbitMQ.",
  "deletedId": 1
}
```

**Kết quả khi không tìm thấy (404):**
```json
{
  "error": "Product not found"
}
```

**Điều gì xảy ra phía sau:**
1. Sản phẩm xóa khỏi **Redis** ngay lập tức
2. Message `product.deleted` publish lên **RabbitMQ**
3. **DB Writer** consume → DELETE khỏi **MariaDB** (async)

---

### 6. Reload toàn bộ cache từ MariaDB → Redis

```
POST /api/cache
```

Dùng khi: Redis bị mất data (restart, flush), cần đồng bộ lại từ MariaDB.

**Kết quả thành công (200):**
```json
{
  "message": "Cache reloaded: 5 products loaded from MariaDB → Redis",
  "count": 5
}
```

---

### 7. Reload cache 1 sản phẩm theo ID

```
POST /api/cache/:id
```

**Ví dụ:** `POST /api/cache/3`

Dùng khi: 1 sản phẩm cụ thể không có trong Redis.

**Kết quả thành công (200):**
```json
{
  "message": "Product id=3 loaded from MariaDB → Redis"
}
```

**Kết quả khi không tìm thấy trong MariaDB (404):**
```json
{
  "error": "Product id=99 not found in MariaDB"
}
```

---

## 🔍 Monitoring

### RabbitMQ Management UI
```
URL:      http://localhost:15672
Username: guest
Password: guest
```

Xem queues, messages, consumers tại tab **Queues**.

### Xem logs từng service

```bash
# Xem DB Writer đã ghi MariaDB chưa
docker compose logs db-writer -f

# Xem Cache Loader đã load Redis chưa
docker compose logs cache-loader -f

# Xem Product Service
docker compose logs product -f
```

---

## 🧪 Kịch bản test hoàn chỉnh (thứ tự khuyến nghị)

### Kịch bản 1: CRUD cơ bản
```
1. GET  /api/products          → xem tất cả (từ Redis)
2. GET  /api/products/1        → xem chi tiết sản phẩm 1
3. POST /api/products          → thêm sản phẩm mới
4. GET  /api/products          → xác nhận sản phẩm mới có trong Redis
5. DELETE /api/products/1      → xóa sản phẩm 1
6. GET  /api/products/1        → nhận 404 (cache miss) + trigger cache.miss
7. GET  /api/products          → sản phẩm 1 không còn
```

### Kịch bản 2: Cache miss + tự động reload
```
1. Flush Redis (docker exec buoi9-redis redis-cli FLUSHALL)
2. GET /api/products           → trả về [] (Redis trống)
3. GET /api/products/1         → 404 + cache.miss được publish
   → Chờ 1-2 giây
4. GET /api/products/1         → 200 (Cache Loader đã load từ MariaDB)
```

### Kịch bản 3: Manual cache reload
```
1. Flush Redis (docker exec buoi9-redis redis-cli FLUSHALL)
2. POST /api/cache             → reload tất cả từ MariaDB → Redis
3. GET  /api/products          → tất cả sản phẩm trở lại
```

---

## 📁 Cấu trúc dự án

```
BUOI_9/
├── docker-compose.yml
├── .gitignore
├── db/
│   └── init.sql                    # Schema + 5 sản phẩm mẫu
├── seeder/
│   ├── index.js                    # Seed MariaDB LOCAL → Redis
│   ├── .env.local                  # Config kết nối local
│   └── package.json
├── services/
│   ├── product-service/            # PU1: CRUD sản phẩm
│   │   ├── index.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── db-writer/                  # Data Pump: RabbitMQ → MariaDB
│   │   ├── index.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── cache-loader/               # Cache Warmer: cache.miss → MariaDB → Redis
│       ├── index.js
│       ├── package.json
│       └── Dockerfile
└── api-gateway/
    ├── index.js
    ├── package.json
    └── Dockerfile
```

---

## 🛑 Dừng hệ thống

```bash
docker compose down              # dừng containers
docker compose down -v           # dừng + xóa volumes (Redis & RabbitMQ data)
```

> Nếu xóa volumes → phải chạy lại `npm run start:local` trong `seeder/` để seed Redis.

---

## 🔗 URL tổng hợp

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:8080 |
| Product Service (direct) | http://localhost:3001/products |
| Cache Loader (direct) | http://localhost:3010/reload |
| RabbitMQ UI | http://localhost:15672 |
| Redis | localhost:6379 |
