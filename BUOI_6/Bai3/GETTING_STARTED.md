# Getting Started - Quick Guide

## 🚀 Chạy toàn bộ hệ thống (Part 3: Service-Based)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- npm

### Option 1: Using Docker Compose (Recommended)

```bash
# 1. Build và run tất cả services
docker-compose up -d

# 2. Check status
docker-compose ps

# 3. Khởi tạo database
docker-compose exec postgres psql -U postgres -d app_db < database/init.sql

# 4. Run frontend locally (ở terminal khác)
cd frontend
npm install
npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:5000
- Database: localhost:5432

### Option 2: Manual Setup (Development)

#### Step 1: Start Database
```bash
docker-compose up -d postgres

# Initialize database
docker-compose exec postgres psql -U postgres -d app_db < database/init.sql
```

#### Step 2: Run API Gateway (Terminal 1)
```bash
cd part3-service-based/api-gateway
npm install
npm start
# Output: 🌐 API Gateway running on http://localhost:5000
```

#### Step 3: Run User Service (Terminal 2)
```bash
cd part3-service-based/user-service
npm install
npm start
# Output: 👤 user-service running on http://localhost:5001
```

#### Step 4: Run Product Service (Terminal 3)
```bash
cd part3-service-based/product-service
npm install
npm start
# Output: 📦 product-service running on http://localhost:5002
```

#### Step 5: Run Order Service (Terminal 4)
```bash
cd part3-service-based/order-service
npm install
npm start
# Output: 📋 order-service running on http://localhost:5003
```

#### Step 6: Run Frontend (Terminal 5)
```bash
cd frontend
npm install
npm run dev
# Output: VITE v4.3.9 ready in 324 ms
# ➜  Local:   http://localhost:3000/
```

### Option 3: Test Individual Parts

#### Part 1: Monolith
```bash
cd part1-monolith
npm install
npm start
# Port: 4000
```

**Test:**
```bash
curl http://localhost:4000/api/users
curl http://localhost:4000/health
```

#### Part 2: 3 Functions
```bash
# Terminal 1
cd part2-functions/user-service && npm install && npm start

# Terminal 2
cd part2-functions/product-service && npm install && npm start

# Terminal 3
cd part2-functions/order-service && npm install && npm start
```

**Test:**
```bash
curl http://localhost:3001/api/users
curl http://localhost:3002/api/products
curl http://localhost:3003/api/orders
```

## 📋 Cấu trúc thư mục

```
BUOI_6/Bai3/
├── README.md                    # Main docs
├── ARCHITECTURE.md              # Architecture details
├── DATABASE.md                  # Database schema
├── GETTING_STARTED.md           # This file
├── docker-compose.yml           # Docker configuration
├── database/
│   └── init.sql                 # Database initialization
├── part1-monolith/              # All features in 1 service
│   ├── index.js
│   ├── package.json
│   └── ...
├── part2-functions/             # 3 independent services
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   └── README.md
├── part3-service-based/         # Service-based + Gateway
│   ├── api-gateway/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   └── README.md
└── frontend/                    # React application
    ├── src/
    ├── package.json
    └── README.md
```

## 🧪 Test API Endpoints

### Through API Gateway (Part 3)

```bash
# Get all users
curl http://localhost:5000/api/users

# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123"
  }'

# Get all products
curl http://localhost:5000/api/products

# Create product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 99.99,
    "stock": 100
  }'

# Get all orders
curl http://localhost:5000/api/orders

# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "product_id": 1,
    "quantity": 2
  }'

# Check health
curl http://localhost:5000/health

# Get info
curl http://localhost:5000/info
```

## 🔧 Common Issues & Solutions

### Issue: Port already in use
```bash
# Windows
netstat -ano | findstr :<PORT>
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:<PORT> | xargs kill -9
```

### Issue: Docker network errors
```bash
docker network ls
docker network rm bai3-network
docker-compose up -d
```

### Issue: Database connection failed
```bash
# Check if postgres is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue: CORS errors
Đảm bảo frontend URL được phép:
```javascript
// In backend index.js
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

### Issue: Services can't communicate
- Kiểm tra networking mode trong docker-compose
- Đảm bảo services ở cùng network
- Kiểm tra .env files có đúng URLs

## 📊 Performance Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway

# Follow new logs
docker-compose logs -f --tail 100
```

### Database Debugging
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d app_db

# Inside psql:
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM orders;
```

## 🛑 Cleanup

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove specific service
docker-compose down api-gateway
```

## 📚 Documentation

- [Architecture Details](ARCHITECTURE.md)
- [Database Schema](DATABASE.md)
- [Part 1: Monolith](part1-monolith/README.md)
- [Part 2: Functions](part2-functions/README.md)
- [Part 3: Service-Based](part3-service-based/README.md)
- [Frontend](frontend/README.md)

## 💡 Learning Path

1. **Understand**: Read ARCHITECTURE.md
2. **Run Part 1**: Start with monolith
3. **Run Part 2**: Compare with functions
4. **Run Part 3**: Full service-based + gateway
5. **Experiment**: Try modifying services
6. **Scale**: Add caching, load balancing, etc.

## 🎯 Next Steps

1. Add authentication (JWT)
2. Implement caching (Redis)
3. Add load balancing (Nginx)
4. Setup CI/CD pipeline
5. Deploy to cloud (AWS, GCP, Azure)
6. Add monitoring (Prometheus, Grafana)
7. Implement message queues (RabbitMQ, Kafka)

## ❓ Help & Support

### Debugging:
- Check service logs: `docker-compose logs <service>`
- Check database: psql terminal commands
- Browser DevTools: Network tab for API calls
- Check .env files: Ensure correct URLs and ports

### Common Commands:
```bash
# Rebuild images
docker-compose build

# Force recreate containers
docker-compose up -d --force-recreate

# Scale services
docker-compose up -d --scale product-service=2

# Execute command in container
docker-compose exec api-gateway npm start
```

Happy Learning! 🚀
