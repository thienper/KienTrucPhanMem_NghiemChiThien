# 🔀 Horizontal Partitioning - Phân chia theo hàng

Chia 1 bảng lớn thành nhiều bảng nhỏ theo **giá trị dữ liệu** (gender, region, date range)

## 📊 Ví dụ: Users Table → Gender-based Split

```
        USERS (10M records)
                ↓
        ┌───────┴───────┐
        ↓               ↓
    table_user_01   table_user_02
    (Nam: 5M)       (Nữ: 5M)
```

---

## 🔧 Setup: Tạo Schema

### Step 1: Database & Tables

```sql
-- Create database
CREATE DATABASE PartitioningDB;
GO

USE PartitioningDB;
GO

-- ========== HORIZONTAL PARTITION: By Gender ==========

-- Nam users table
CREATE TABLE table_user_01 (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    gender CHAR(3) NOT NULL DEFAULT 'Nam',
    age INT,
    city NVARCHAR(50),
    phone NVARCHAR(20),
    created_at DATETIME DEFAULT GETDATE(),
    INDEX idx_gender NONCLUSTERED (gender),
    INDEX idx_email NONCLUSTERED (email),
    INDEX idx_city NONCLUSTERED (city)
);

-- Nữ users table
CREATE TABLE table_user_02 (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    gender CHAR(3) NOT NULL DEFAULT 'Nữ',
    age INT,
    city NVARCHAR(50),
    phone NVARCHAR(20),
    created_at DATETIME DEFAULT GETDATE(),
    INDEX idx_gender NONCLUSTERED (gender),
    INDEX idx_email NONCLUSTERED (email),
    INDEX idx_city NONCLUSTERED (city)
);

-- Base user table (for UNION all queries)
CREATE TABLE users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    gender CHAR(3) NOT NULL,  -- Nam, Nữ
    age INT,
    city NVARCHAR(50),
    phone NVARCHAR(20),
    created_at DATETIME DEFAULT GETDATE(),
    INDEX idx_gender NONCLUSTERED (gender),
    INDEX idx_email NONCLUSTERED (email)
);

GO
```

---

## 📥 Sample Data Insertion

```sql
-- ========== INSERT Sample Data ==========

-- Insert for Nam users
INSERT INTO table_user_01 (name, email, gender, age, city, phone)
VALUES
    ('Nguyễn Văn A', 'nguyenvana@gmail.com', 'Nam', 25, 'Hà Nội', '0912345678'),
    ('Trần Văn B', 'tranvanb@gmail.com', 'Nam', 30, 'TP HCM', '0923456789'),
    ('Lê Văn C', 'levanc@gmail.com', 'Nam', 28, 'Đà Nẵng', '0934567890'),
    ('Phạm Văn D', 'phamvand@gmail.com', 'Nam', 35, 'Hải Phòng', '0945678901'),
    ('Dương Văn E', 'duongvane@gmail.com', 'Nam', 26, 'Hà Nội', '0956789012');

GO

-- Insert for Nữ users
INSERT INTO table_user_02 (name, email, gender, age, city, phone)
VALUES
    ('Nguyễn Thị F', 'nguyenthif@gmail.com', 'Nữ', 24, 'Hà Nội', '0967890123'),
    ('Trần Thị G', 'tranthig@gmail.com', 'Nữ', 29, 'TP HCM', '0978901234'),
    ('Lê Thị H', 'lethih@gmail.com', 'Nữ', 27, 'Đà Nẵng', '0989012345'),
    ('Phạm Thị I', 'phamthi@gmail.com', 'Nữ', 32, 'Hải Phòng', '0990123456'),
    ('Dương Thị J', 'duongthij@gmail.com', 'Nữ', 23, 'Hà Nội', '0901234567');

GO

-- Insert into base users table (for reference)
INSERT INTO users (name, email, gender, age, city, phone)
SELECT * FROM table_user_01
UNION ALL
SELECT * FROM table_user_02;

GO
```

---

## 🔍 Query Examples

### Query 1: Find Nam Users by City

```sql
-- ✅ Good! Uses partition key (gender)
SELECT user_id, name, email, age, city, phone
FROM table_user_01  -- Only Nam table
WHERE city = 'Hà Nội'
ORDER BY created_at DESC;

-- Result: Only searches table_user_01 (5M rows max instead of 10M)
-- Performance: ~100ms instead of 1000ms
```

### Query 2: Find Nữ Users

```sql
SELECT user_id, name, email, age, city, phone
FROM table_user_02  -- Only Nữ table
WHERE age > 25
ORDER BY name;

-- Fast! Only 5M rows searched
```

### Query 3: Get All Users (UNION approach)

```sql
-- ⚠️ When you need to search across all partitions
SELECT user_id, name, email, gender, age, city, phone
FROM table_user_01
UNION ALL
SELECT user_id, name, email, gender, age, city, phone
FROM table_user_02
WHERE city = 'Hà Nội';

-- Performance: Parallel search on both tables
```

### Query 4: Count by Gender (Aggregate)

```sql
SELECT 
    'Nam' AS gender,
    COUNT(*) AS total_users,
    AVG(age) AS avg_age,
    COUNT(DISTINCT city) AS cities
FROM table_user_01

UNION ALL

SELECT 
    'Nữ' AS gender,
    COUNT(*) AS total_users,
    AVG(age) AS avg_age,
    COUNT(DISTINCT city) AS cities
FROM table_user_02;

-- Output:
-- gender | total_users | avg_age | cities
-- Nam    | 5000000     | 31.2    | 64
-- Nữ     | 5000000     | 29.8    | 63
```

---

## 🎯 Horizontal Partitioning Application Logic (Spring Boot)

```java
@Service
public class HorizontalPartitionService {
    
    // Determine partition based on gender
    public String getPartitionName(String gender) {
        if ("Nam".equals(gender)) {
            return "table_user_01";
        } else if ("Nữ".equals(gender)) {
            return "table_user_02";
        }
        throw new IllegalArgumentException("Invalid gender");
    }
    
    // Insert user to correct partition
    public void insertUser(User user) {
        String partition = getPartitionName(user.getGender());
        String sql = String.format(
            "INSERT INTO %s (name, email, gender, age, city, phone) VALUES (?, ?, ?, ?, ?, ?)",
            partition
        );
        // Execute SQL...
    }
    
    // Query from specific partition
    public List<User> getUsersByGender(String gender) {
        String partition = getPartitionName(gender);
        String sql = String.format(
            "SELECT * FROM %s WHERE gender = ?",
            partition
        );
        // Execute SQL...
    }
    
    // Query from all partitions
    public List<User> getAllUsers() {
        String sql = """
            SELECT * FROM table_user_01
            UNION ALL
            SELECT * FROM table_user_02
            """;
        // Execute SQL...
    }
}
```

---

## ⚡ Performance Comparison

| Scenario | Without Partition | With Horizontal Partition |
|----------|-----------------|--------------------------|
| Find Nam users in Hà Nội | Scan 10M rows, 1500ms | Scan 5M rows, 150ms ✅ |
| Count by gender | Scan 10M rows, 2000ms | Scan each partition: 500ms ✅ |
| Insert new user | Lock 10M row table | Lock only 5M rows ✅ |
| Update index | Rebuild 10M index | Rebuild 5M index ✅ |
| Get all users | 1000ms | 1500ms (slight overhead) |

---

## ⚙️ Partition Routing Logic

```
User Input:
  gender = "Nam"
        ↓
Routing Service:
  if gender == "Nam" 
    → table_user_01
  if gender == "Nữ"
    → table_user_02
        ↓
Execute Query:
  SELECT * FROM table_user_01 WHERE ...
        ↓
Result:
  ✅ Fast! SearchedScale-out: 5M records instead of 10M
```

---

## 💡 Best Practices

### ✅ DO:

1. **Always use partition key in WHERE clause**
   ```sql
   -- Good!
   SELECT * FROM table_user_01 WHERE gender = 'Nam' AND city = 'Hà Nội'
   ```

2. **Keep partition sizes balanced**
   - If 99% users are Nam, 1% Nữ
   - Partition not effective!
   - Consider different partition key

3. **Index each partition**
   ```sql
   CREATE INDEX idx_city ON table_user_01(city)
   CREATE INDEX idx_city ON table_user_02(city)
   ```

4. **Handle partition in application**
   ```java
   String partition = getPartitionName(gender)
   query("SELECT * FROM " + partition + " WHERE ...")
   ```

### ❌ DON'T:

1. **Don't UNION without reason**
   ```sql
   -- Bad! Scans all partitions
   SELECT * FROM table_user_01
   UNION ALL
   SELECT * FROM table_user_02
   WHERE name = 'John'  -- Name not partition key!
   ```

2. **Don't forget partition key**
   ```sql
   -- Bad! Need to search both tables
   SELECT * FROM table_user_01, table_user_02
   WHERE table_user_01.user_id = table_user_02.user_id
   ```

3. **Don't partition too many ways**
   - By gender, city, age, date... too complex!
   - Choose 1 primary partition key

---

## 🔄 Maintenance

### Add new partition (for new gender value)

```sql
-- If need to support "Khác" gender
CREATE TABLE table_user_03 (
    -- Same structure as others
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100),
    email NVARCHAR(100),
    gender CHAR(3) DEFAULT 'Khác',
    -- ... other columns
);

-- Update routing logic in application
if ("Khác".equals(gender)) return "table_user_03";
```

### Monitor partition sizes

```sql
SELECT 
    'table_user_01' AS partition_name,
    COUNT(*) AS row_count,
    (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users)) AS percentage
FROM table_user_01

UNION ALL

SELECT 
    'table_user_02' AS partition_name,
    COUNT(*) AS row_count,
    (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users)) AS percentage
FROM table_user_02;

-- If unbalanced → consider different partition key!
```

---

## 🚀 Next Steps

1. **Run setup.sql** → Create tables
2. **Run sample-data.sql** → Insert data
3. **Run queries.sql** → Test performance
4. **Implement in Spring Boot** → Route based on gender
5. **Benchmark** → Compare with/without partition

---

**Files**:
- [setup.sql](./setup.sql) - Create tables
- [sample-data.sql](./sample-data.sql) - Insert data
- [queries.sql](./queries.sql) - Query examples

**Next**: [2_vertical-partition/](../2_vertical-partition/) for column-based partitioning
