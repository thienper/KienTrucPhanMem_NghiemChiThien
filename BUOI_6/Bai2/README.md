# Bài 2: Database Partitioning (Phân chia cơ sở dữ liệu)

## 📚 Overview - Phân chia DB là gì?

**Database Partitioning** = Chia nhỏ 1 bảng lớn thành nhiều bảng/phần nhỏ hơn để tăng performance

### ⚡ Lợi ích

| Lợi ích | Giải thích |
|---------|-----------|
| **Tốc độ query** | Tìm kiếm trên bảng nhỏ nhanh hơn lớn |
| **Giảm memory** | Không cần load toàn bộ data vào RAM |
| **Scalability** | Dễ mở rộng & quản lý |
| **Maintainability** | Index nhỏ, rebuild nhanh hơn |
| **Concurrency** | Nhiều process truy cập khác nhau không xung đột |

### 📊 Ví dụ Hiệu Năng

```
Bảng user: 10 triệu records
├─ Without partition: Query 5 triệu records trong 5 giây ❌
└─ With partition: Query từ file_user_05 (500k records) trong 0.5 s ✅
```

---

## 🎯 3 Loại Partitioning

### 1️⃣ **Horizontal Partitioning** (Phân chia theo hàng)

```
┌─────────────────────────────────┐
│      Users Table (10M rows)     │
├─────────────────────────────────┤
│ ID | Name | Gender | ...       │
├─────────────────────────────────┘
        ↓ SPLIT
┌──────────────┬──────────────┐
│ table_user01 │ table_user02 │
├──────────────┼──────────────┤
│ Nam (5M)     │ Nữ (5M)      │
└──────────────┴──────────────┘
```

**Cách hoạt động**:
- Chia bảng theo **giá trị dữ liệu** (Gender, Region, Date range)
- Mỗi partition là bảng riêng
- Application xác định partition nào cần query

**Ưu điểm**: ✅ Distribute load, ✅ Query nhanh  
**Nhược điểm**: ❌ Phức tạp logic query, ❌ Join khó

---

### 2️⃣ **Vertical Partitioning** (Phân chia theo cột)

```
┌────────────────────────┐
│    Users Table         │
├────────────────────────┤
│ ID|Name|Email|Phone|.. │
│ 1 |John|john@|555-1234 │
└────────────────────────┘
        ↓ SPLIT
┌──────────────┬──────────────────┐
│ users_core   │ users_contact    │
├──────────────┼──────────────────┤
│ ID|Name|Pass │ ID|Email|Phone   │
│ 1 |John|****   │ 1 |john@|555-1234│
└──────────────┴──────────────────┘
```

**Cách hoạt động**:
- Chia bảng theo **column** (tách những cột hay access từ những cột ít dùng)
- Thường dùng khi bảng quá rộng
- Mỗi partition chứa 1 subset của columns

**Ưu điểm**: ✅ Optimize caching, ✅ Tìm user detail nhanh  
**Nhược điểm**: ❌ Cần JOIN khi query toàn bộ data

---

### 3️⃣ **Function-Based Partitioning** (Phân chia bằng hàm)

```
┌────────────────────────┐
│    Users Table         │
├────────────────────────┤
│ ID | Name | Created   │
│ 1  | John | 2024-01-01│
│ 2  | Jane | 2024-02-15│
└────────────────────────┘
        ↓ PARTITION FUNCTION
┌─────────────────────┬─────────────────────┐
│ users_2024_q1       │ users_2024_q2       │
├─────────────────────┼─────────────────────┤
│ Range: 01-01 - 03-31│ Range: 04-01 - 06-30│
└─────────────────────┴─────────────────────┘
```

**Cách hoạt động**:
- Database **tự động** chia bảng theo logic (range, modulo, hash)
- SQL Server tự handle routing
- Ít phức tạp logic ở application

**Ưu điểm**: ✅ Automatic, ✅ Transparent to app, ✅ Database optimized  
**Nhược điểm**: ❌ Yêu cầu database support

---

## 📁 Cấu Trúc Dự Án

```
Bai2/
├── README.md (file này)
│
├── 1_horizontal-partition/
│   ├── README.md
│   ├── setup.sql          # SQL Server schema
│   ├── sample-data.sql    # Insert data
│   └── queries.sql        # Query examples
│
├── 2_vertical-partition/
│   ├── README.md
│   ├── setup.sql
│   ├── sample-data.sql
│   └── queries.sql
│
├── 3_function-partition/
│   ├── README.md
│   ├── setup.sql
│   └── queries.sql
│
├── spring-boot-app/       # Express.js/Spring Boot router
│   ├── pom.xml
│   ├── src/
│   │   ├── main/java/com/example/partition/
│   │   │   ├── model/User.java
│   │   │   ├── service/
│   │   │   │   ├── HorizontalPartitionService.java
│   │   │   │   ├── VerticalPartitionService.java
│   │   │   │   └── FunctionPartitionService.java
│   │   │   ├── controller/PartitionController.java
│   │   │   └── PartitionApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └──
│   └── docker-compose.yml
│
└── PERFORMANCE_COMPARISON.md
```

---

## 🚀 Quick Start

### Option 1: SQL Server Only

```bash
# 1. Horizontal partition
cd 1_horizontal-partition
sqlcmd -S localhost -U sa -P YourPassword < setup.sql
sqlcmd -S localhost -U sa -P YourPassword < sample-data.sql

# 2. Query
sqlcmd -S localhost -U sa -P YourPassword < queries.sql
```

### Option 2: SQL Server + Spring Boot

```bash
# 1. Start SQL Server (Docker)
cd spring-boot-app
docker-compose up -d

# 2. Wait for DB init
sleep 10

# 3. Run Spring Boot app
mvn spring-boot:run

# 4. Call endpoints
curl http://localhost:8080/partition/horizontal/users?gender=nam
curl http://localhost:8080/partition/vertical/user/1
curl http://localhost:8080/partition/function/users?month=01
```

---

## 📊 Performance Comparison

### Without Partition (Monolithic Table)
```sql
SELECT * FROM users WHERE gender = 'Nam'
-- Scan: 10,000,000 rows
-- Time: 5000ms
-- Memory: 2GB
```

### With Horizontal Partition
```sql
SELECT * FROM table_user_01  -- Only Nam partition
-- Scan: 5,000,000 rows
-- Time: 500ms  (10x faster!)
-- Memory: 200MB
```

### With Vertical Partition (Contact Info)
```sql
SELECT u.*, uc.email, uc.phone
FROM users_core u
JOIN users_contact uc ON u.id = uc.user_id
-- Separate scans, better cache usage
-- Time: 200ms  (25x faster for core queries!)
```

### With Function Partition (By Month)
```sql
SELECT * FROM users WHERE created_month = '2024-01'
-- Database automatically routes to partition_2024_01
-- Time: 100ms  (50x faster!)
-- Very efficient & automatic
```

---

## 🎓 Learning Path

### Beginner (1 hour)
1. Read this README
2. Understand 3 types of partitioning
3. Run SQL examples

### Intermediate (2 hours)
1. Read 3 detailed partition guides
2. Understand when to use each type
3. Analyze performance differences

### Advanced (3 hours)
1. Deploy Spring Boot application
2. Implement partition routing logic
3. Benchmark performance improvements

---

## 🔍 When to Use Each Type?

### Horizontal Partitioning
✅ Use when:
- Large table with natural split criteria (gender, region, date range)
- Different parts have similar query patterns
- Need to distribute load across multiple servers

❌ Don't use when:
- Table splits unevenly (e.g., 99% female, 1% male)
- Need complex cross-partition JOINs

**Example**: User table split by gender → table_user_01 (Nam), table_user_02 (Nữ)

### Vertical Partitioning
✅ Use when:
- Table too wide (many columns)
- Some columns accessed frequently, others rarely
- Want to optimize cache for frequently accessed columns

❌ Don't use when:
- Always need all columns together
- Too many cross-partition JOINs

**Example**: User table split → users_basic (ID, name, email), users_profile (bio, avatar, preferences)

### Function-Based Partitioning
✅ Use when:
- Database supports native partitioning (SQL Server, Oracle)
- Clear range/modulo logic (date ranges, hash ranges)
- Want automatic handling

❌ Don't use when:
- Using simple file-based database
- Complex custom partitioning logic needed

**Example**: Partition by created date → Q1_2024, Q2_2024, Q3_2024, Q4_2024

---

## 💡 Key Points to Remember

1. **Partitioning ≠ Sharding**
   - Partitioning: Single database, multiple tables
   - Sharding: Multiple databases

2. **Always use Partition Key** in WHERE clause
   ```sql
   -- Good! Uses partition key
   SELECT * FROM users WHERE gender = 'Nam'
   
   -- Bad! Scans all partitions
   SELECT * FROM users WHERE name = 'John'
   ```

3. **Application must know partition logic**
   ```
   User input (gender) → Determine partition → Query partition
   ```

4. **Monitor partition skew**
   - If partition sizes too different → uneven load distribution

---

## 📖 Next Steps

1. **Read**: [1_horizontal-partition/README.md](1_horizontal-partition/README.md)
2. **Try**: SQL examples in each partition folder
3. **Deploy**: Spring Boot application
4. **Benchmark**: Compare performance with/without partitioning

---

## 🤔 Common Questions

**Q: Can I partition on multiple columns?**  
A: Yes, but get complicated. Usually partition on 1 key (primary partition key).

**Q: Can I change partition strategy later?**  
A: Yes, but requires migration. Plan ahead!

**Q: Which partitioning should I use?**  
A: Start with Horizontal if clear split criteria exist. Use Vertical for wide tables. Use Function for date-based data.

**Q: Performance improvement guarantee?**  
A: Not guaranteed. Depends on:
- Partition key in WHERE clause
- Even distribution across partitions
- Proper indexing on each partition

---

**Status**: Ready to learn! 🚀  
**Time**: ~3 hours for complete mastery  
**Difficulty**: Intermediate  
**Skills**: SQL Server, Java/Spring Boot, Database Design

Let's partition! 💾
