# Part 1: Monolithic Architecture

## Mô tả
Ứng dụng monolithic truyền thống - tất cả business logic (User, Product, Order) được nhóm lại trong một ứng dụng duy nhất.

## Cấu trúc
```
part1-monolith/
├── index.js          # Main application with ALL routes
├── db.js            # Database connection
├── .env             # Environment variables
├── package.json
└── README.md
```

## Đặc điểm

✅ **Ưu điểm:**
- Đơn giản, dễ bắt đầu
- Một codebase duy nhất
- Dễ debug và test
- Internal function calls, không cần network

❌ **Nhược điểm:**
- Khó scale từng feature riêng
- Thay đổi một phần cần deploy toàn bộ
- Khó quản lý khi dự án lớn
- Team khó làm việc song song


## Cách chạy

### 1. Cài đặt dependencies
```bash
cd part1-monolith
npm install
```

### 2. Copy .env (đã có)
```bash
# .env file already configured
```

### 3. Đảm bảo PostgreSQL Running
```bash
# Docker should be running with:
docker-compose up -d postgres
```

### 4. Khởi tạo database
```bash
# From root directory
docker-compose exec postgres psql -U postgres -d app_db < database/init.sql
```

### 5. Chạy application
```bash
npm start
# hoặc development mode với auto-reload:
npm run dev
```

## API Endpoints

### Users
- `GET /api/users` - Lấy danh sách user
- `POST /api/users` - Tạo user mới
  ```json
  {
    "username": "john",
    "email": "john@example.com",
    "password": "pass123"
  }
  ```

### Products
- `GET /api/products` - Lấy danh sách product
- `POST /api/products` - Tạo product mới
  ```json
  {
    "name": "Laptop",
    "description": "High-end laptop",
    "price": 999.99,
    "stock": 10
  }
  ```

### Orders
- `GET /api/orders` - Lấy danh sách order
- `POST /api/orders` - Tạo order mới
  ```json
  {
    "user_id": 1,
    "product_id": 1,
    "quantity": 2
  }
  ```

### Health Check
- `GET /health` - Server status


## Cách test

### Curl Commands
```bash
# Get users
curl http://localhost:4000/api/users

# Create user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123"}'

# Create product
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Mouse","description":"Wireless","price":29.99,"stock":50}'

# Create order
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"product_id":1,"quantity":2}'
```

### Postman/Insomnia
- Import requests từ [endpoints.json](../endpoints.json)

## Key Points

1. **Single Deployment Unit**: Tất cả feature đóng gói trong 1 service
2. **Tight Coupling**: Routes tất cả quản lý trực tiếp qua index.js
3. **Shared Database**: Một database cho tất cả
4. **Internal Logic**: Gọi function trực tiếp, không qua API

## Next Step: Part 2
Xem [Part 2: 3 Functions-Based Architecture](../part2-functions/README.md) để hiểu cách tách monolith thành 3 services độc lập.
