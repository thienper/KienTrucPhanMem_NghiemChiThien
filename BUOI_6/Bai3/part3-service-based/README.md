# Part 3: Service-Based Architecture + API Gateway

## Mô tả
Kiến trúc dịch vụ nâng cao với API Gateway tập trung. Tất cả requests đi qua Gateway, sau đó được route tới các services cụ thể.

## Cấu trúc
```
part3-service-based/
├── api-gateway/
│   ├── index.js          # Central router
│   ├── .env
│   └── package.json
├── user-service/
│   ├── index.js
│   ├── db.js
│   ├── .env
│   └── package.json
├── product-service/
│   ├── index.js
│   ├── db.js
│   ├── .env
│   └── package.json
├── order-service/
│   ├── index.js
│   ├── db.js
│   ├── .env
│   └── package.json
└── README.md
```

## Đặc điểm

✅ **Ưu điểm:**
- **Centralized Request Handling**: Tất cả logic routing ở 1 chỗ
- **Single Entry Point**: Frontend chỉ giao tiếp với Gateway
- **Easy to Add Features**: Logging, authentication, rate limiting tại Gateway
- **Service Isolation**: Services chỉ lo business logic
- **Better Error Handling**: Gateway xử lý errors từ services
- **Scalable**: Có thể scale từng service độc lập

❌ **Nhược điểm:**
- **Gateway Complexity**: Logic tăng ở Gateway
- **Single Point of Failure**: Nếu Gateway down, tất cả down (cần redundancy)
- **Extra Latency**: Thêm 1 hop so với direct calls


## Architecture Comparison

```
Part 1 (Monolith):
Frontend → [All Logic] → Database

Part 2 (Functions):
Frontend → {User Svc, Product Svc, Order Svc} → Database

Part 3 (Service-Based):
Frontend → [API Gateway] → {User Svc, Product Svc, Order Svc} → Database
```

## Cách chạy

### 1. Setup tất cả services
```bash
cd api-gateway && npm install
cd ../user-service && npm install
cd ../product-service && npm install
cd ../order-service && npm install
```

### 2. Khởi động database
```bash
docker-compose up -d postgres
docker-compose exec postgres psql -U postgres -d app_db < ../../database/init.sql
```

### 3. Chạy tất cả services (4 terminals)

**Terminal 1 - API Gateway:**
```bash
cd api-gateway
npm start
# 🌐 API Gateway running on http://localhost:5000
```

**Terminal 2 - User Service:**
```bash
cd user-service
npm start
# 👤 user-service running on http://localhost:5001
```

**Terminal 3 - Product Service:**
```bash
cd product-service
npm start
# 📦 product-service running on http://localhost:5002
```

**Terminal 4 - Order Service:**
```bash
cd order-service
npm start
# 📋 order-service running on http://localhost:5003
```

## API Endpoints (Through Gateway)

Tất cả requests từ frontend đi tới Gateway ở **port 5000**:

```
GET    /api/users              # Route to User Service
GET    /api/users/:id
POST   /api/users

GET    /api/products           # Route to Product Service
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id

GET    /api/orders             # Route to Order Service
GET    /api/orders/:id
POST   /api/orders
```

## Cách test

### Through API Gateway (Recommended)

Get all users:
```bash
curl http://localhost:5000/api/users
```

Create user:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","email":"bob@example.com","password":"123"}'
```

Create product:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","description":"Mechanical","price":150.00,"stock":20}'
```

Create order (calls multiple services):
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"product_id":1,"quantity":2}'
```

### Service Health Check
```bash
curl http://localhost:5000/health
```

Output:
```json
{
  "gateway": "running",
  "services": {
    "user": { "status": "User Service running", ... },
    "product": { "status": "Product Service running", ... },
    "order": { "status": "Order Service running", ... }
  }
}
```

### Get Gateway Info
```bash
curl http://localhost:5000/info
```

## Gateway Benefits

### 1. Centralized Logging
```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

### 2. Authentication (Coming Soon)
```javascript
app.use(authenticateToken); // JWT verification
```

### 3. Rate Limiting (Easy to add)
```javascript
const rateLimit = require('express-rate-limit');
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

### 4. Request Transformation
```javascript
// All requests validated here before forwarding
```

## Key Points

1. **Single Frontend Connection**: Frontend giao tiếp chỉ với Gateway
2. **Gateway Abstraction**: Frontend không cần biết về internal services
3. **Service Independence**: Services phát triển độc lập
4. **Shared Database**: Tất cả services dùng 1 DB
5. **Scalability**: Scale từng service theo demand


## Comparison Summary

| Feature | Part 1 | Part 2 | Part 3 |
|---------|--------|--------|--------|
| **Complexity** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Scalability** | ❌ | ✅ | ✅✅ |
| **Maintainability** | ✅ | ⚠️ | ✅✅ |
| **Request Path** | Direct | Direct | Gateway |
| **Entry Points** | 1 | 3 | 1 |
| **Real World Use** | Startups | Growing Teams | Enterprise |


## Next: Frontend

Xem [Frontend Documentation](../../frontend/README.md) để tạo React UI cho tất cả 3 phases.
