# Architecture Overview

## 1. MONOLITH ARCHITECTURE

```
┌─────────────────────────────────┐
│         Frontend (React)        │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Monolith Application       │
│  ┌──────────────────────────┐   │
│  │ User Controller/Routes   │   │
│  │ Product Controller/Routes│   │
│  │ Order Controller/Routes  │   │
│  ├──────────────────────────┤   │
│  │ Shared Services          │   │
│  │ - UserService            │   │
│  │ - ProductService         │   │
│  │ - OrderService           │   │
│  ├──────────────────────────┤   │
│  │ Shared Database Layer    │   │
│  └──────────────────────────┘   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      PostgreSQL Database        │
│  - users table                  │
│  - products table               │
│  - orders table                 │
└─────────────────────────────────┘
```

**Đặc điểm:**
- Single codebase
- Tất cả logic trong một ứng dụng
- Deploy toàn bộ khi có thay đổi
- Dễ quản lý nhưng khó scale


## 2. FUNCTION-BASED ARCHITECTURE (3 Functions)

```
┌─────────────────────────────────┐
│         Frontend (React)        │
└──────────────┬──────────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
┌────▼─────┐     ┌────────────────┐    ┌─────────────┐
│ User     │     │ Product        │    │ Order       │
│ Service  │     │ Service        │    │ Service     │
│ :3001    │     │ :3002          │    │ :3003       │
└────┬─────┘     └────┬───────────┘    └─────┬───────┘
     │                │                      │
     └────────────────┼──────────────────────┘
                      │
          ┌───────────▼────────────┐
          │  PostgreSQL Database   │
          │  (Shared via network)  │
          └────────────────────────┘
```

**Đặc điểm:**
- Mỗi function là một service riêng
- Chạy trên port khác nhau
- Gọi nhau qua HTTP/API
- Cùng database nhưng độc lập


## 3. SERVICE-BASED ARCHITECTURE

```
┌──────────────────────────────────┐
│       Frontend (React)           │
│       http://localhost:3000      │
└──────────────┬───────────────────┘
               │
┌──────────────▼───────────────────┐
│        API Gateway               │
│     (Express Server)             │
│  - Route /api/users -> UserSvc   │
│  - Route /api/products -> ProdSvc│
│  - Route /api/orders -> OrderSvc │
│  - Central request/response mgmt │
└──────────────┬───────────────────┘
     ┌─────────┼─────────┐
     │         │         │
┌────▼─┐  ┌────┴──┐  ┌───┴────┐
│User  │  │Prod.  │  │ Order  │
│Svc   │  │Svc    │  │ Svc    │
│:5001 │  │:5002  │  │ :5003  │
└────┬─┘  └────┬──┘  └───┬────┘
     │         │         │
     └─────────┼─────────┘
               │
       ┌───────▼────────┐
       │   PostgreSQL   │
       │   (Shared)     │
       └────────────────┘
```

**Đặc điểm:**
- API Gateway tập trung
- Services là business logic units
- Dễ extend và maintain
- Scalable architecture


## 4. Key Improvements

### Monolith → Functions:
- ✅ Tách logic, deploy độc lập
- ✅ Scale từng service riêng biệt
- ✅ Team có thể làm việc song song
- ❌ Phức tạp hơn khi integration

### Functions → Service-Based:
- ✅ API Gateway quản lý tập trung
- ✅ Consistent request handling
- ✅ Dễ add authentication/logging
- ✅ Load balancing
- ❌ Thêm complexity với gateway

## 5. Database Schema

Tất cả 3 phần dùng cùng schema:

```
users
├── id (PK)
├── username
├── email
├── password
└── created_at

products
├── id (PK)
├── name
├── price
├── stock
└── created_at

orders
├── id (PK)
├── user_id (FK -> users)
├── product_id (FK -> products)
├── quantity
├── total_price
└── created_at
```
