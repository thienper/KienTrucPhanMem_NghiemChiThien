# Bài 1: Image Optimization + Data Persistence

## 📚 Nội dung

### Task 1: Image Optimization
- **Mục tiêu**: Tối ưu hóa Docker image từ 4 stages → 2 → 1
- **Công cụ**: Multi-stage builds, Alpine base images
- **Kết quả**: Giảm kích thước ~70% (từ 500MB → 180MB)

### Task 2: PostgreSQL Data Persistence
- **Mục tiêu**: Lưu trữ dữ liệu PostgreSQL trên volumes
- **Công cụ**: Docker volumes, docker-compose
- **Kết quả**: Dữ liệu vẫn tồn tại ngay cả sau khi container bị xóa

---

## 📁 Cấu trúc thư mục

```
Bai1/
├── task1-image-optimization/
│   ├── app/
│   │   ├── package.json       # Node.js dependencies
│   │   └── server.js          # Simple Express app
│   ├── Dockerfile.4stage      # 4-stage multi-build
│   ├── Dockerfile.2stage      # 2-stage optimized
│   ├── Dockerfile.1stage      # 1-stage tối ưu nhất
│   └── README_OPTIMIZATION.md # Hướng dẫn chi tiết
│
├── task2-postgres-persistence/
│   ├── Dockerfile            # PostgreSQL custom image
│   ├── init.sql              # Database initialization script
│   ├── docker-compose.yml    # Docker Compose orchestration
│   └── README_PERSISTENCE.md # Hướng dẫn chi tiết
│
└── README.md (file này)
```

---

## 🚀 Quick Start

### Task 1: Image Optimization

```bash
# Navigate to task 1
cd task1-image-optimization

# Build 4-stage image
docker build -t node-app:4stage -f Dockerfile.4stage .

# Build 2-stage image
docker build -t node-app:2stage -f Dockerfile.2stage .

# Build 1-stage image
docker build -t node-app:1stage -f Dockerfile.1stage .

# Compare image sizes
docker images | grep node-app

# Run any version
docker run -p 3000:3000 node-app:1stage

# Test application
curl http://localhost:3000/health
```

**Expected Output**:
```
node-app   1stage    abc123...   180MB
node-app   2stage    def456...   200MB
node-app   4stage    ghi789...   500MB
```

### Task 2: PostgreSQL Persistence

```bash
# Navigate to task 2
cd task2-postgres-persistence

# Option A: Using Docker Compose (Recommended)
docker-compose up -d
docker-compose exec postgres psql -U postgres -d app_db -c "SELECT * FROM users;"
docker-compose down  # Data vẫn lưu được
docker-compose up -d # Data được khôi phục!

# Option B: Manual approach
docker build -t postgres:with-data .
docker run -d --name postgres_container -v postgres_data:/var/lib/postgresql/data postgres:with-data
docker exec postgres_container psql -U postgres -d app_db -c "SELECT * FROM users;"
docker commit postgres_container postgres:seed-data
```

**Expected Output**:
```
 id |    username     |        email        |    full_name     
----+-----------------+---------------------+------------------
  1 | john_doe        | john@example.com    | John Doe
  2 | jane_smith      | jane@example.com    | Jane Smith
  ... (5 rows)
```

---

## 📊 Key Concepts

### 1. Multi-Stage Docker Builds

**Vấn đề**: Một Dockerfile với tất cả build tools trong production image = image lớn

**Giải pháp**: Multi-stage builds
- Stage 1 (Builder): Cài tất cả dependencies
- Stage 2+ (Intermediate): Chạy build, lint, test
- Final Stage (Runtime): Copy artifacts, chạy app

**Kết quả**: Production image chỉ chứa những gì cần thiết

### 2. Docker Volumes

**Vấn đề**: Container data không persistent → stop/rm = mất dữ liệu

**Giải pháp**: Docker Volumes
- Named Volumes: Quản lý bởi Docker, dữ liệu an toàn
- Bind Mounts: Mount từ host filesystem
- tmpfs: Trong memory, không persistent

**Lifecycle**:
```
docker run -v volume_name:/path
  ↓
Container tạo/sửa dữ liệu
  ↓
docker stop/rm container
  ↓
Volume vẫn tồn tại
  ↓
docker run -v volume_name:/path (container mới)
  ↓
Dữ liệu được khôi phục!
```

### 3. PostgreSQL Initialization

**Auto-initialization**: Files trong `/docker-entrypoint-initdb.d/` tự động chạy:
- `.sql` files: Thực thi SQL
- `.sh` files: Thực thi shell scripts

**init.sql** của chúng ta:
- Tạo database `app_db`
- Tạo table `users`
- Insert sample data
- Tạo indexes

---

## 🔬 Comparison Analysis

### Image Size Reduction
| Stage | Size | Growth Analysis |
|-------|------|------------------|
| 4-stage | ~500MB | Base + Build tools + Test tools + Runtime |
| 2-stage | ~200MB | Base + Build tools + Runtime |
| 1-stage | ~180MB | Base + Runtime (optimal) |

**Reduction**: 500MB → 180MB = **64% nhỏ hơn**

### Build and Run Process

**4-stage**:
- Chạy 4 layers + final layer
- Có linting/testing built-in (nhưng không output)
- Lâu nhất

**2-stage**:
- Chạy 2 layers
- Loại bỏ linting/testing (nên làm trước)
- Nhanh hơn 4-stage

**1-stage**:
- Chạy 1 layer
- Nhanh nhất
- Nhỏ nhất
- Bảo mật tốt: không build tools trong image

---

## 🎯 Learning Outcomes

### Task 1 - Sau hoàn thành, bạn sẽ hiểu:

✅ Multi-stage Docker builds
✅ Alpine vs Full-size images
✅ Layer optimization
✅ COPY vs ADD commands
✅ Cache busting strategies
✅ Security: non-root users dalam Dockerfile
✅ Health checks

### Task 2 - Sau hoàn thành, bạn sẽ hiểu:

✅ Docker volumes (named, bind, tmpfs)
✅ Container initialization scripts
✅ PostgreSQL environment variables
✅ data.sql for seeding databases
✅ docker-compose orchestration
✅ Container lifecycle management
✅ Volume management commands

---

## 🐛 Troubleshooting

### Task 1: Image Build Fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker build --no-cache -t node-app:1stage -f Dockerfile.1stage .
```

### Task 1: Port Already in Use
```bash
# Find and stop container using port 3000
docker ps
docker stop <CONTAINER_ID>

# Or use different port
docker run -p 3001:3000 node-app:1stage
```

### Task 2: PostgreSQL Won't Start
```bash
# Check logs
docker logs postgres_container
docker-compose logs postgres

# Check volume
docker volume ls
docker volume inspect postgres_data

# Reset (⚠️ loses data)
docker volume rm postgres_data
docker-compose down -v
docker-compose up -d
```

### Task 2: Can't Connect to PostgreSQL
```bash
# Verify container is running
docker ps | grep postgres

# Check network connectivity
docker exec postgres_container pg_isready -U postgres

# Test connection
docker exec -it postgres_container psql -U postgres
```

---

## 📖 Additional Resources

### Docker Official Docs
- [Best practices for Dockerfiles](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Volumes](https://docs.docker.com/storage/volumes/)
- [Docker Compose](https://docs.docker.com/compose/)

### Key Files to Study
- [Dockerfile.4stage](./task1-image-optimization/Dockerfile.4stage) - Full build pipeline
- [Dockerfile.1stage](./task1-image-optimization/Dockerfile.1stage) - Production optimized
- [docker-compose.yml](./task2-postgres-persistence/docker-compose.yml) - Orchestration
- [init.sql](./task2-postgres-persistence/init.sql) - Database initialization

---

## 🎓 Exercises

### Extend Task 1
1. **Challenge**: Thêm React frontend vào app
   - Multi-stage build cho React (build → runtime)
   - Nginx để serve static files
   - Combine với Node.js backend

2. **Challenge**: Tạo `.dockerignore` file
   - Loại bỏ node_modules, .git, .env
   - So sánh kích thước image

### Extend Task 2
1. **Challenge**: Backup & Restore
   - `pg_dump` để backup data
   - Restore từ backup file

2. **Challenge**: Add Node.js frontend
   - Connect frontend to PostgreSQL via backend
   - docker-compose service khác

3. **Challenge**: Replication
   - Master-slave PostgreSQL setup
   - Trong docker-compose

---

## ✅ Completion Checklist

### Task 1
- [ ] Build Dockerfile.4stage thành công
- [ ] Build Dockerfile.2stage thành công
- [ ] Build Dockerfile.1stage thành công
- [ ] So sánh kích thước: `docker images`
- [ ] Chạy 1stage container: `docker run`
- [ ] Test `/health` endpoint
- [ ] Hiểu từng stage trong Dockerfile

### Task 2
- [ ] Dockerfile build thành công
- [ ] docker-compose up chạy được
- [ ] Initial data trong PostgreSQL
- [ ] Data persistent sau stop/rm
- [ ] Data khôi phục sau restart
- [ ] Hiểu volumes và initialization

---

## 🤝 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker logs <container>`
2. Kiểm tra Docker daemon: `docker ps`
3. Clear cache: `docker system prune -a`
4. Reset everything: `docker system prune -a --volumes`

---

**Total Learning Time**: ~1-2 hours  
**Difficulty Level**: Intermediate  
**Prerequisites**: Docker basics, Docker Compose basics

Good luck! 🚀
