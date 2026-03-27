# Bài 3: Monolith → 3 Functions → Service-Based Architecture

## Mục tiêu
Hiểu rõ quá trình transformation từ kiến trúc Monolith → Functions → Service-Based Architecture với 1 Database chung.

## Cấu trúc bài tập

### Part 1: Monolith (Kiến trúc đơn khối)
- Một ứng dụng duy nhất chứa tất cả business logic
- Tất cả features (Users, Products, Orders) trong một codebase
- **File**: `part1-monolith/`

### Part 2: Functions (3 microservices - Function-based)
- Chia ứng dụng thành 3 functions riêng biệt:
  - **User Service**: Quản lý người dùng
  - **Product Service**: Quản lý sản phẩm
  - **Order Service**: Quản lý đơn hàng
- Mỗi function là một microservice độc lập
- **File**: `part2-functions/`

### Part 3: Service-Based Architecture (Advanced)
- Refactor các functions thành services
- Thêm API Gateway để route requests
- Thêm Shared Database
- **File**: `part3-service-based/`

## Công nghệ sử dụng
- **Backend**: Node.js + Express
- **Frontend**: React (TypeScript)
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose

## Cách chạy

```bash
# Chạy tất cả services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# DB: localhost:5432
```

## Key Differences

| Aspect | Monolith | Functions | Service-Based |
|--------|----------|-----------|---------------|
| **Deployment** | 1 instance | 3 functions | 3 services + gateway |
| **Scalability** | Khó | Có thể | Tốt |
| **Dependencies** | Liên kết chặt | Độc lập | Lỏng lẻo |
| **Database** | 1 DB | 1 DB | 1 DB (Shared) |
| **Communication** | Internal | API calls | API + Gateway |

## Tài liệu thêm
- Xem `ARCHITECTURE.md` để hiểu sâu hơn mô hình kiến trúc
- Xem `DATABASE.md` để hiểu schema database
