# 📊 Vertical Partitioning - Phân chia theo cột

Chia 1 bảng rộng thành nhiều bảng hẹp theo **nhóm columns** (tách frequently accessed columns)

## 🔄 Ví dụ: User Table → Core + Contact + Profile

```
    USERS (Many columns - too wide!)
          ↓
    ┌─────┴──────┬────────────┐
    ↓            ↓             ↓
users_core | users_contact | users_profile
(ID,Name) | (Email,Phone)  | (Bio,Avatar)
```

---

## 🔧 Setup: Tạo Schema

```sql
USE PartitioningDB;
GO

-- ========== VERTICAL PARTITION: By Column Usage Pattern ==========

-- Core user information (frequently accessed)
CREATE TABLE users_core (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    gender CHAR(3),
    date_of_birth DATE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    INDEX idx_username NONCLUSTERED (username)
);

-- Contact information (moderate access)
CREATE TABLE users_contact (
    user_id INT PRIMARY KEY,
    email NVARCHAR(100) UNIQUE,
    phone NVARCHAR(20),
    secondary_email NVARCHAR(100),
    secondary_phone NVARCHAR(20),
    address NVARCHAR(255),
    city NVARCHAR(50),
    country NVARCHAR(50),
    postal_code VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users_core(user_id)
);

-- Profile information (less frequently accessed)
CREATE TABLE users_profile (
    user_id INT PRIMARY KEY,
    bio NVARCHAR(500),
    avatar_url VARCHAR(500),
    cover_url VARCHAR(500),
    website NVARCHAR(100),
    social_facebook VARCHAR(100),
    social_twitter VARCHAR(100),
    interests NVARCHAR(500),
    preferred_language VARCHAR(10),
    timezone VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users_core(user_id)
);

-- Company information (work-related)
CREATE TABLE users_company (
    user_id INT PRIMARY KEY,
    company_name NVARCHAR(150),
    job_title NVARCHAR(100),
    department NVARCHAR(100),
    salary DECIMAL(12,2),
    hire_date DATE,
    employee_id VARCHAR(20),
    office_location NVARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users_core(user_id)
);

GO
```

---

## 📥 Sample Data & Queries

```sql
-- Insert core data
INSERT INTO users_core (name, username, password_hash, gender, date_of_birth)
VALUES
    ('Nguyễn Văn A', 'nguyena', 'hash123', 'Nam', '1995-05-15'),
    ('Trần Thị B', 'tranb', 'hash456', 'Nữ', '1998-08-20');

-- Insert contact data (lazy load - only when needed)
INSERT INTO users_contact (user_id, email, phone, city, country)
VALUES
    (1, 'nguyena@email.com', '0912345678', 'Hà Nội', 'Việt Nam'),
    (2, 'tranb@email.com', '0923456789', 'TP HCM', 'Việt Nam');

-- Insert company data (rarely accessed)
INSERT INTO users_company (user_id, company_name, job_title, salary)
VALUES
    (1, 'Tech Corp', 'Developer', 20000000),
    (2, 'Design Inc', 'Designer', 18000000);

GO
```

---

## 🎯 Query Examples

### Query 1: Get user core info (fast!)

```sql
SELECT * FROM users_core WHERE user_id = 1;
-- Fast! Only loads frequently-used columns
-- Smaller row size = better cache hit rate
```

### Query 2: Full user info (JOIN)

```sql
SELECT 
    c.user_id,
    c.name,
    c.username,
    ct.email,
    ct.phone,
    cp.company_name,
    cp.job_title
FROM users_core c
LEFT JOIN users_contact ct ON c.user_id = ct.user_id
LEFT JOIN users_company cp ON c.user_id = cp.user_id
WHERE c.user_id = 1;
```

### Query 3: Get profile (profile page)

```sql
SELECT 
    c.name,
    c.username,
    p.bio,
    p.avatar_url,
    ct.email,
    ct.phone
FROM users_core c
LEFT JOIN users_profile p ON c.user_id = p.user_id
LEFT JOIN users_contact ct ON c.user_id = ct.user_id
WHERE c.user_id = 1;
```

---

## ⚡ Performance Benefit

| Scenario | Without Vertical Partition | With Vertical Partition |
|----------|---------------------------|------------------------|
| Get username/email | Load 50 columns, 1MB per row | Load 5 columns, 0.1MB per row |
| Cache hit rate | 30% (row too big) | 80% (row smaller) | 
| Query core info | 500ms (load unnecessary data) | 50ms ✅ |
| Load profile + company | Join 2 tables, 100ms | JOIN efficient ✅ |

---

## 🔑 Key Insight

```
Vertical partitioning is GREAT when:
- Table very wide (50+ columns)
- Different columns accessed in different queries
- Want to optimize cache

Example:
- Login query: only needs core (username, password)
- Profile page: needs core + contact + profile
- Admin panel: needs core + company + profile

→ Vertical partition separates these concerns!
```

---

**Next**: [3_function-partition/](../3_function-partition/) for SQL Server native partitioning
