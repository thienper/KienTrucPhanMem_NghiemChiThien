# 🔢 Function-Based Partitioning - SQL Server Native

Lợi dụng **SQL Server Partition Function & Scheme** để tự động chia bảng

## 📅 Ví dụ: Partition by Date Range (Every Month)

```
    USERS (Partitioned by created_date)
    ├─ Q1_2024 (Jan-Mar)
    ├─ Q2_2024 (Apr-Jun)
    ├─ Q3_2024 (Jul-Sep)
    └─ Q4_2024 (Oct-Dec)
```

---

## 🔧 SQL Server Setup

```sql
USE PartitioningDB;
GO

-- ========== CREATE PARTITION FUNCTION ==========
-- Define the boundary values for partitioning

CREATE PARTITION FUNCTION pf_DateRange (DATETIME)
AS RANGE RIGHT
FOR VALUES (
    '2024-01-01',
    '2024-02-01',
    '2024-03-01',
    '2024-04-01',
    '2024-05-01',
    '2024-06-01',
    '2024-07-01',
    '2024-08-01',
    '2024-09-01',
    '2024-10-01',
    '2024-11-01',
    '2024-12-01'
);

GO

-- ========== CREATE PARTITION SCHEME ==========
-- Map partitions to filegroups

CREATE PARTITION SCHEME ps_DateRange
AS PARTITION pf_DateRange
TO ([PRIMARY], [PRIMARY], [PRIMARY], [PRIMARY], [PRIMARY], [PRIMARY],
    [PRIMARY], [PRIMARY], [PRIMARY], [PRIMARY], [PRIMARY], [PRIMARY], [PRIMARY]);

GO

-- ========== CREATE PARTITIONED TABLE ==========

CREATE TABLE users_partitioned (
    user_id INT IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    gender CHAR(3),
    age INT,
    city NVARCHAR(50),
    salary DECIMAL(12,2),
    created_date DATETIME DEFAULT GETDATE(),
    PRIMARY KEY NONCLUSTERED (user_id),
    CONSTRAINT pk_users_partitioned PRIMARY KEY CLUSTERED (created_date, user_id)
) ON ps_DateRange (created_date);

GO

-- ========== CREATE INDEXES ON PARTITIONED TABLE ==========

CREATE NONCLUSTERED INDEX idx_email_partitioned
ON users_partitioned (email)
WHERE email IS NOT NULL;

CREATE NONCLUSTERED INDEX idx_gender_partitioned
ON users_partitioned (gender)
INCLUDE (name, city);

GO

PRINT 'Partition function and scheme created!';

```

---

## 🔍 Query Examples

### Query 1: Get January 2024 data (Single partition)

```sql
-- SQL Server SMART ROUTING: Only searches 2024-01 partition!
SELECT * FROM users_partitioned
WHERE created_date >= '2024-01-01' 
  AND created_date < '2024-02-01'
ORDER BY created_date DESC;

-- Execution plan:
-- Index Seek (Partition 2) --> Only 1 partition scanned!
```

### Query 2: Spanning multiple partitions

```sql
-- Searches Q1 2024 (Jan, Feb, Mar)
SELECT * FROM users_partitioned
WHERE created_date >= '2024-01-01'
  AND created_date < '2024-04-01'
ORDER BY created_date DESC;

-- Execution plan:
-- Parallelizes across partitions 2, 3, 4
-- Much faster than scanning the whole table!
```

### Query 3: Query all partitions

```sql
SELECT 
    CONVERT(VARCHAR(10), created_date, 23) AS date,
    COUNT(*) AS user_count,
    COUNT(DISTINCT gender) AS unique_genders,
    CAST(AVG(salary) AS DECIMAL(12,2)) AS avg_salary
FROM users_partitioned
WHERE YEAR(created_date) = 2024
GROUP BY CONVERT(VARCHAR(10), created_date, 23)
ORDER BY date;
```

---

## 📊 Monitor Partitions

```sql
-- See partition information
SELECT 
    ps.name AS partition_scheme,
    pf.name AS partition_function,
    prv.$PARTITION_NUMBER AS partition_number,
    COUNT(*) AS row_count,
    MIN(created_date) AS min_date,
    MAX(created_date) AS max_date
FROM users_partitioned AS prv
CROSS APPLY sys.dm_db_partition_info(
    OBJECT_ID('users_partitioned'), 1
) AS part
JOIN sys.partition_schemes ps ON part.partition_scheme_id = ps.data_space_id
JOIN sys.partition_functions pf ON ps.function_id = pf.function_id
GROUP BY ps.name, pf.name, prv.$PARTITION_NUMBER
ORDER BY partition_number;
```

---

## ✅ Benefits of Function Partitioning

| Aspect | Benefit |
|--------|---------|
| Automatic routing | Database handles which partition automatically |
| Transparent to app | App doesn't need partition logic |
| Query optimization | SQL Server only scans needed partitions |
| Maintenance | Can add/drop partitions easily |
| Scalability | Can split to different filegroups/servers |

---

## 🚀 Best For

✅ **Range partitions by date** (most common)
- Time-series data
- Logs, transactions by month/year
- Archiving old data easy

✅ **Hash partitions** (load distribution)
- Distribute random data evenly
- Reduce lock contention

❌ **NOT for**
- Frequent ad-hoc queries on non-partition key
- Very uneven partition sizes
- Complex custom logic

---

**Next**: Spring Boot application to tie it all together!
