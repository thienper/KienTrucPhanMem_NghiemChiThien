# Task 1: Image Optimization - Multi-Stage Docker Builds

## Mục tiêu
Giảm kích thước image Docker từ 4 stages → 2 stages → 1 stage (tối ưu nhất)

## 📊 Kích thước dự kiến
| Phiên bản | Stages | Kích thước | Mô tả |
|-----------|--------|-----------|-------|
| **4-stage** | 4 | ~500MB | Builder + Linter + Tester + Runtime |
| **2-stage** | 2 | ~200MB | Builder + Runtime (loại bỏ linting, testing) |
| **1-stage** | 1 | ~180MB | Tối ưu - chỉ production (loại bỏ tất cả layers không cần thiết) |

## 🚀 Hướng dẫn Build & So sánh

### 1️⃣ Build 4-Stage Image
```bash
# Build
docker build -t node-app:4stage -f Dockerfile.4stage .

# Kiểm tra kích thước
docker images node-app:4stage

# Run
docker run -p 3000:3000 node-app:4stage

# Test
curl http://localhost:3000/health
```

**Phân tích**: 4 stages chứa tất cả công cụ build, testing, linting
- Dùng tài nguyên lớn nhất
- Image cuối cùng vẫn nhỏ vì chỉ copy node_modules và code
- Nhưng quá trình build lâu hơn

### 2️⃣ Build 2-Stage Image
```bash
# Build
docker build -t node-app:2stage -f Dockerfile.2stage .

# Kiểm tra kích thước
docker images node-app:2stage

# Run
docker run -p 3000:3000 node-app:2stage

# Test
curl http://localhost:3000/health
```

**Phân tích**: 2 stages - chỉ giữ lại cần thiết
- Builder: Cài dependencies (clean cache)
- Runtime: Chỉ copy dependencies đã build
- Loại bỏ: linting, testing (nên làm trước khi build image)
- Kết quả: ~60% nhỏ hơn 4-stage

### 3️⃣ Build 1-Stage Image (Tối ưu nhất)
```bash
# Build
docker build -t node-app:1stage -f Dockerfile.1stage .

# Kiểm tra kích thước
docker images node-app:1stage

# Run
docker run -p 3000:3000 node-app:1stage

# Test
curl http://localhost:3000/health
```

**Phân tích**: 1 stage tối ưu
- Chỉ node:18-alpine (cơ sở tối thiểu)
- Install production dependencies
- Copy app code
- Thêm security: non-root user
- Kết quả: ~20% nhỏ hơn 2-stage

## 📈 So sánh chi tiết

### Kích thước Disk
```bash
# Liệt kê tất cả images
docker images | grep node-app

# Xem chi tiết từng layer
docker history node-app:4stage
docker history node-app:2stage
docker history node-app:1stage
```

### Build Time
```bash
# Build và đo thời gian
time docker build -t node-app:4stage -f Dockerfile.4stage .
time docker build -t node-app:2stage -f Dockerfile.2stage .
time docker build -t node-app:1stage -f Dockerfile.1stage .
```

### Memory Usage
```bash
# Run container và kiểm tra memory
docker stats node-app:1stage
```

## 🎯 Insights - Tại sao 1-stage tốt nhất?

✅ **Ưu điểm 1-stage:**
- Image nhỏ nhất → push/pull nhanh hơn
- Build nhanh hơn → CI/CD tối ưu
- Bảo mật: không chứa build tools, dependencies dev
- Đơn giản: dễ maintain

❌ **Nhược điểm (cách khắc phục):**
- Không thể lint/test trong Dockerfile
  → Giải pháp: Chạy linting/testing trước (trong CI/CD pipeline)
- Nếu cần debug build
  → Giải pháp: Dùng 2-stage, build stage có tất cả tools

## 💡 Best Practices

1. **Sử dụng Alpine images** (`node:18-alpine` vs `node:18`)
   - Alpine = ~40MB vs ~900MB

2. **Multi-stage builds**
   - Tách build environment từ runtime
   - Copy chỉ artifacts cần thiết

3. **Minimize layers**
   - Gộp RUN commands: `RUN apt-get install && apt-get clean`
   - Loại bỏ cache: `npm cache clean --force`

4. **Security**
   - Chạy app với non-root user
   - Base image từ trusted sources

5. **Healthcheck**
   - Giúp orchestrator (Docker Compose, K8s) theo dõi container

## 🔧 Dockerfile Layers Analysis

### 4-Stage
```
Stage 1 (Builder):    node:18-alpine + npm install
Stage 2 (Linter):     node:18-alpine + eslint (không dùng)
Stage 3 (Tester):     node:18-alpine + test tools (không dùng)
Stage 4 (Runtime):    node:18-alpine + node_modules (từ Stage 1)
```
**→ Tất cả stages được build nhưng chỉ Stage 4 được output**

### 2-Stage
```
Stage 1 (Builder):    node:18-alpine + npm install
Stage 2 (Runtime):    node:18-alpine + node_modules (từ Stage 1)
```
**→ Loại bỏ stages không cần dùng cho production**

### 1-Stage
```
Single:               node:18-alpine + npm install + app code
                      + non-root user
```
**→ Tối ưu tối đa: chỉ những gì production cần**

---

## 📋 Checklist Optimize Image của bạn

- [ ] Sử dụng Alpine base image
- [ ] Multi-stage build (nếu cần build tools)
- [ ] Copy `.dockerignore` để bỏ qua files không cần
- [ ] Minimize layers: gộp RUN commands
- [ ] Clean cache sau install: `npm cache clean`
- [ ] Sử dụng non-root user
- [ ] Add healthcheck
- [ ] Kiểm tra image size: `docker images`
- [ ] Kiểm tra history: `docker history image:tag`
