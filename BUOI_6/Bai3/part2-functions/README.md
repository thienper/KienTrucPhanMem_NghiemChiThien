# Part 2: Functions-Based Architecture (3 Microservices)

## Mô tả
Ứng dụng được chia thành 3 services (functions) độc lập, mỗi service chịu trách nhiệm một domain:
- **User Service (Port 3001)** - Quản lý người dùng
- **Product Service (Port 3002)** - Quản lý sản phẩm
- **Order Service (Port 3003)** - Quản lý đơn hàng

## Cấu trúc
```
part2-functions/
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
- Mỗi service độc lập, có thể deploy riêng
- Scale từng service theo nhu cầu
- Team khác nhau có thể phát triển services riêng
- Dễ debug một service cụ thể

❌ **Nhược điểm:**
- Phức tạp hơn - cần quản lý 3 processes
- Gọi API qua network (latency)
- Cần tối ưu hóa inter-service communication
- Người dùng phải gọi từng service riêng


## Service to Service Communication

### Order Service → User Service
```javascript
// Verify user exists
axios.get('http://localhost:3001/api/users/:id')
```

### Order Service → Product Service
```javascript
// Get product details & price
axios.get('http://localhost:3002/api/products/:id')
```

## Cách chạy

### 1. Setup tất cả services
```bash
# User Service
cd user-service
npm install

# Product Service (từ tab khác)
cd product-service
npm install

# Order Service (từ tab khác)
cd order-service
npm install
```

### 2. Run database
```bash
docker-compose up -d postgres
docker-compose exec postgres psql -U postgres -d app_db < ../../database/init.sql
```

### 3. Chạy 3 services (mỗi cái ở terminal khác)

**Terminal 1 - User Service:**
```bash
cd user-service
npm start
# 👤 user-service running on http://localhost:3001
```

**Terminal 2 - Product Service:**
```bash
cd product-service
npm start
# 📦 product-service running on http://localhost:3002
```

**Terminal 3 - Order Service:**
```bash
cd order-service
npm start
# 📋 order-service running on http://localhost:3003
```

## API Endpoints

### User Service (Port 3001)
```
GET    /api/users              # List all users
GET    /api/users/:id          # Get specific user
POST   /api/users              # Create new user
```

### Product Service (Port 3002)
```
GET    /api/products           # List all products
GET    /api/products/:id       # Get specific product
POST   /api/products           # Create new product
PUT    /api/products/:id       # Update product
```

### Order Service (Port 3003)
```
GET    /api/orders             # List all orders
GET    /api/orders/:id         # Get specific order
POST   /api/orders             # Create new order
```

## Cách test

### Create User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"123"}'
```

### Create Product
```bash
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"Gaming laptop","price":1500.00,"stock":5}'
```

### Create Order (sẽ gọi User Service & Product Service)
```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"product_id":1,"quantity":2}'
```

### Get all orders
```bash
curl http://localhost:3003/api/orders
```

## Key Differences from Monolith

| Feature | Monolith | Functions |
|---------|----------|-----------|
| Deployment | 1 server (port 4000) | 3 servers (3001, 3002, 3003) |
| Scaling | Cả ứng dụng | Từng service |
| Communication | Internal function calls | HTTP API calls |
| Database | Shared (1 connection pool) | Shared (nhưng 3 connection pools) |
| Complexity | Thấp | Trung bình |


## Challenges & Solutions

### 1. Service Discovery
**Challenge:** Order Service cần biết Product Service ở port 3002

**Solution:** Hardcoded URLs trong `.env`
```
PRODUCT_SERVICE_URL=http://localhost:3002
```

### 2. Network Latency
**Challenge:** Gọi API qua network chậm hơn internal calls

**Solution:** Caching, request pooling (ở Part 3)

### 3. Error Handling
**Challenge:** Nếu Product Service down, Order Service bị lỗi

**Solution:** Retry logic, circuit breaker (ở Part 3)


## Next Step: Part 3
Xem [Part 3: Service-Based Architecture](../part3-service-based/README.md) để thêm API Gateway và improve architecture.
