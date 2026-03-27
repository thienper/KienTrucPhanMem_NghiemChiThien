# 🔍 Task 2: Data Ở Đâu & Chạy Như Thế Nào?

## 📍 Data Ở Đâu?

### 1️⃣ **Source: init.sql** (Định nghĩa dữ liệu)
```
📁 task2-postgres-persistence/
   └── init.sql ← Data định nghĩa ở đây!
```

**Nội dung init.sql**:
```sql
-- Step 1: Tạo database
CREATE DATABASE app_db;

-- Step 2: Tạo table users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Insert 5 users (5 dòng dữ liệu)
INSERT INTO users (username, email, full_name) VALUES
  ('john_doe', 'john@example.com', 'John Doe'),
  ('jane_smith', 'jane@example.com', 'Jane Smith'),
  ('mike_johnson', 'mike@example.com', 'Mike Johnson'),
  ('sarah_williams', 'sarah@example.com', 'Sarah Williams'),
  ('david_brown', 'david@example.com', 'David Brown');
```

### 2️⃣ **Storage: Docker Volume** (Lưu trữ dữ liệu)

```
┌─────────────────────────────────────────────────────┐
│              DOCKER VOLUME STORAGE                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  INSIDE CONTAINER:                                  │
│  /var/lib/postgresql/data/  ← Mount point           │
│  ├─ users table (dữ liệu)                          │
│  ├─ indexes                                         │
│  └─ PostgreSQL system files                        │
│           ↕ (volume mount)                          │
│  HOST MACHINE:                                      │
│  /var/lib/docker/volumes/postgres_data/_data/      │
│  ├─ (Tất cả dữ liệu được lưu ở đây)                │
│  └─ (Persistent - ngay cả container xóa)           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Kiểm tra volume**:
```bash
# List volumes
docker volume ls | grep postgres
# Output: local  postgres_persistence_postgres_data

# Inspect volume detail
docker volume inspect postgres_persistence_postgres_data
# Shows: Mountpoint: /var/lib/docker/volumes/.../_data
```

### 3️⃣ **Data Path Mapping**

```
init.sql (file)
    ↓
Dockerfile COPY init.sql /docker-entrypoint-initdb.d/
    ↓
Container startup
    ↓
PostgreSQL tự chạy init.sql
    ↓
Data được insert vào table
    ↓
Saved to volume postgres_data
    ↓
Persistent on host machine! ✓
```

---

## 🚀 Chạy Như Thế Nào? (Chi Tiết từng Bước)

### **Option A: Docker Compose (Recommended - Đơn giản nhất)**

#### Bước 1: Khởi động services
```bash
cd task2-postgres-persistence
docker-compose up -d
```

**Chuyện gì xảy ra**:
1. Đọc `docker-compose.yml`
2. Build image từ `Dockerfile`:
   - Base: `postgres:15-alpine`
   - Copy `init.sql` vào `/docker-entrypoint-initdb.d/`
3. Run container với:
   - Name: `postgres_persistence`
   - Port: `5432:5432`
   - Volume: `postgres_data:/var/lib/postgresql/data`
   - Network: `app_network`

**Output**:
```
[+] Building 2.5s (5/5) FINISHED
[+] Running 2/2
  ✓ Network app_network Created
  ✓ Container postgres_persistence Started
```

#### Bước 2: Chờ PostgreSQL khởi động & init.sql chạy
```bash
# Kiểm tra logs
docker-compose logs postgres

# Output sẽ có:
# PostgreSQL init process complete; ready for start up.
# database system is ready to accept connections
# ✓ Container started & init.sql executed!
```

**Tại sao?**
- PostgreSQL container có thể mất 2-5 giây để khởi động
- Trong quá trình khởi động, PostgreSQL tự động chạy files trong `/docker-entrypoint-initdb.d/`
- `init.sql` được execute đầu tiên (và chỉ một lần)

#### Bước 3: Kiểm tra dữ liệu
```bash
# Query data
docker-compose exec postgres psql -U postgres -d app_db -c "SELECT * FROM users;"

# Output:
#  id |    username     |        email        |    full_name     
# ----+-----------------+---------------------+------------------
#   1 | john_doe        | john@example.com    | John Doe
#   2 | jane_smith      | jane@example.com    | Jane Smith
#   3 | mike_johnson    | mike@example.com    | Mike Johnson
#   4 | sarah_williams  | sarah@example.com   | Sarah Williams
#   5 | david_brown     | david@example.com   | David Brown
# (5 rows)

✅ Data đã được insert thành công!
```

#### Bước 4: Kiểm tra volume
```bash
# Volume được tạo
docker volume ls | grep postgres_data
# Output: postgres_persistence_postgres_data

# Inspect chi tiết
docker volume inspect postgres_persistence_postgres_data
# Output:
# "Mountpoint": "/var/lib/docker/volumes/postgres_persistence_postgres_data/_data"
```

#### Bước 5: TEST - Dừng container (data vẫn lưu!)
```bash
# Stop & remove containers nhưng giữ volumes
docker-compose down

# Verify container gone
docker ps | grep postgres
# (không có output = container gone)

# Verify volume vẫn tồn tại
docker volume ls | grep postgres_data
# postgres_persistence_postgres_data ← Vẫn ở đây! ✓
```

#### Bước 6: Restart - Data được khôi phục! ✨
```bash
# Khởi động lại
docker-compose up -d

# Chờ 3-5 giây
sleep 5

# Query data
docker-compose exec postgres psql -U postgres -d app_db -c "SELECT * FROM users;"

# Output: Vẫn 5 rows!
# Dữ liệu được khôi phục từ volume! 🎉
```

---

### **Option B: Manual Approach (Để hiểu chi tiết)**

#### Bước 1: Build Custom Image
```bash
# Build từ Dockerfile
docker build -t postgres:with-data .

# Chuyện gì xảy ra:
# - Retrieve postgres:15-alpine base image
# - Copy init.sql → /docker-entrypoint-initdb.d/init.sql
# - Done! Image sẵn sàng tạo containers
```

#### Bước 2: Run Container với Volume
```bash
docker run -d \
  --name postgres_container \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=app_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:with-data

# Giải thích từng option:
# -d                              = Run in background (detach)
# --name postgres_container       = Container name
# -e POSTGRES_PASSWORD=...        = Set password
# -e POSTGRES_DB=app_db           = Create this database
# -p 5432:5432                    = Map port (host:container)
# -v postgres_data:/var/lib/...   = Mount volume (volume_name:container_path)
# postgres:with-data              = Image to run
```

**Chuyện gì xảy ra**:
1. Container started
2. PostgreSQL initializes
3. Automatically runs `init.sql` (vì nó ở `/docker-entrypoint-initdb.d/`)
4. Database `app_db` được tạo
5. Table `users` được tạo
6. 5 users được insert

#### Bước 3: Verify Container Running
```bash
# Check container
docker ps | grep postgres_container

# Output:
# CONTAINER ID   IMAGE              STATUS              PORTS
# abc123...      postgres:with-data  Up 2 seconds        0.0.0.0:5432→5432/tcp
```

#### Bước 4: Connect & Query Data
```bash
# Connect to database
docker exec -it postgres_container psql -U postgres -d app_db

# Inside psql shell, run queries:
SELECT * FROM users;
SELECT COUNT(*) FROM users;
\d users  -- Show table structure
\q        -- Exit
```

#### Bước 5: Commit Container → Tạo Image với Data
```bash
# Current container đã có data
# Tạo image từ container này (bao gồm cả data)
docker commit postgres_container postgres:with-seed-data

# Now new image has data baked in!
docker images | grep postgres:with-seed-data
```

#### Bước 6: Stop & Remove Old Container
```bash
docker stop postgres_container
docker rm postgres_container
```

#### Bước 7: Run Container từ Seeded Image
```bash
docker run -d \
  --name postgres_new \
  -v postgres_new_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:with-seed-data

# Container này có seed data từ image!
```

#### Bước 8: Verify Data in New Container
```bash
docker exec postgres_new psql -U postgres -d app_db -c "SELECT * FROM users;"

# Output: 5 rows
# Data vẫn ở đây từ image: ✓
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   APPLICATION START                      │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  1. docker-compose.yml (configuration)                   │
│     ├─ service: postgres                                 │
│     ├─ build: Dockerfile                                 │
│     ├─ volumes:                                          │
│     │  ├─ postgres_data:/var/lib/postgresql/data   │
│     │  ├─ ./init.sql:/docker-entrypoint-initdb... │
│     └─ ports: 5432:5432                                 │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  2. Dockerfile (image definition)                        │
│     ├─ FROM postgres:15-alpine                          │
│     ├─ COPY init.sql /docker-entrypoint-initdb.d/       │
│     └─ EXPOSE 5432                                       │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  3. IMAGE BUILT                                          │
│     Image contains: Base PG + init.sql definition  │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  4. CONTAINER STARTED                                    │
│     PostgreSQL initializes & sees init.sql              │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  5. init.sql EXECUTED AUTOMATICALLY                     │
│     ├─ CREATE DATABASE app_db                           │
│     ├─ CREATE TABLE users (...)                         │
│     └─ INSERT 5 users                                   │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  6. DATA STORED IN VOLUME                               │
│     Location: postgres_data (Docker managed)      │
│     Host path: /var/lib/docker/volumes/.../data/  │
│     Status: PERSISTENT ✓                                │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  7. CONTAINER READY                                      │
│     Listening on localhost:5432                         │
│     Database: app_db                                    │
│     Users table: 5 rows                                 │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Command Reference

### Docker Compose Way (Simple)
```bash
# Start
docker-compose up -d

# Check data
docker-compose exec postgres psql -U postgres -d app_db -c "SELECT * FROM users;"

# Stop (data persists!)
docker-compose down

# Restart (data restored!)
docker-compose up -d
```

### Manual Way (Learning)
```bash
# Build
docker build -t postgres:with-data .

# Run with volume
docker run -d --name pg \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:with-data

# Check data
docker exec pg psql -U postgres -d app_db -c "SELECT * FROM users;"

# Commit image (with data)
docker commit pg postgres:seed-data
```

---

## 🔗 File Relationships

```
init.sql (Data Definition)
    ↓ (COPIED by)
Dockerfile (Container Recipe)
    ↓ (BUILT as)
postgres:with-data (Image)
    ↓ (STARTED as)
postgres_container (Container)
    ↓ (AUTO-EXECUTES)
init.sql runs automatically
    ↓ (STORES in)
postgres_data volume
    ↓ (PERSISTS in)
/var/lib/docker/volumes/.../
```

---

## ✅ Verification Checklist

- [ ] `init.sql` file exists: `ls init.sql`
- [ ] Dockerfile copies init.sql: `cat Dockerfile | grep "COPY init.sql"`
- [ ] docker-compose.yml mounts files: `docker-compose config`
- [ ] Container starts: `docker-compose up -d`
- [ ] Data inserted: `SELECT COUNT(*) FROM users;` → 5 rows
- [ ] Volume created: `docker volume ls | grep postgres`
- [ ] Data persists after stop: `docker-compose down && docker-compose up -d`

---

## 🚀 Now You Know!

✅ **Data ở đâu**:
- Definition: `init.sql` file
- Storage: `postgres_data` volume
- Host machine: `/var/lib/docker/volumes/postgres_data/_data/`

✅ **Chạy như thế nào**:
- Docker Compose: `docker-compose up -d` (Simple)
- Manual: `docker run -v postgres_data:...` (Learning)
- Both auto-execute init.sql on container start

✅ **Data flow**:
- init.sql → Dockerfile COPY → Build image
- Image → Run container → Auto-run init.sql
- Data → Stored in volume → Persistent forever ✓

---

**Next**: Try both approaches and see how data persists! 🎉
