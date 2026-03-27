# Bài 2: Database Partitioning - Lý Thuyết (Phân chia cơ sở dữ liệu)

## 📚 Khái Niệm - Database Partitioning là gì?

**Database Partitioning** = Kỹ thuật chia nhỏ một bảng lớn thành nhiều bảng/phần nhỏ hơn (gọi là partition) để tối ưu hóa hiệu suất truy vấn.

### ⚡ Các Lợi Ích Chính

| Lợi Ích | Giải Thích Chi Tiết |
|---------|-------------------|
| **Tốc độ truy vấn** | Tìm kiếm trên bảng nhỏ nhanh hơn bảng lớn (O(log n) vs O(n)) |
| **Giảm tiêu thụ bộ nhớ** | Không cần load toàn bộ dữ liệu vào RAM, chỉ load partition cần thiết |
| **Khả năng mở rộng (Scalability)** | Dễ dàng thêm partition mới mà không ảnh hưởng partition hiện có |
| **Bảo trì dễ dàng (Maintainability)** | Index nhỏ hơn → rebuild nhanh hơn, quản lý dễ hơn |
| **Tính đồng thời (Concurrency)** | Nhiều process truy cập partition khác nhau không xung đột, tăng throughput |
| **Quản lý dung lượng** | Có thể archive/xóa các partition cũ độc lập |

### 📊 So Sánh Hiệu Suất

```
Bảng user: 10 triệu records
├─ KHÔNG dùng partition: 
│  └─ Query gender='Nam': Quét 10M records → 5000ms ❌
│
└─ CÓ dùng partition (tách theo gender):
   ├─ table_user_nam: 5M records
   ├─ table_user_nu: 5M records
   └─ Query gender='Nam': Quét 5M records → 500ms ✅ (10x nhanh hơn!)
```

---

## 🎯 Ba Loại Partitioning Chính

### 1️⃣ **Horizontal Partitioning** (Phân chia theo hàng / Row-based)

#### Định Nghĩa
Chia một bảng thành nhiều bảng nhỏ dựa trên **giá trị của một cột** (được gọi là partition key).

#### Mô Hình

```
┌─────────────────────────────────────────────┐
│         Bảng Users gốc (10M rows)           │
├─────────────────────────────────────────────┤
│ ID | Name | Gender | Salary | Department   │
│ 1  | John | Nam    | 10M    | IT            │
│ 2  | Jane | Nữ     | 9M     | HR            │
│ 3  | Mike | Nam    | 11M    | IT            │
│ 4  | Lisa | Nữ     | 8M     | Sales         │
└─────────────────────────────────────────────┘
             ↓ PHÂN CHIA THEO GENDER
┌──────────────────────────┬──────────────────────────┐
│  table_user_nam          │  table_user_nu           │
│  (5M rows)               │  (5M rows)               │
├──────────────────────────┼──────────────────────────┤
│ ID | Name | Salary | ... │ ID | Name | Salary | ... │
│ 1  | John | 10M    |     │ 2  | Jane | 9M     |     │
│ 3  | Mike | 11M    |     │ 4  | Lisa | 8M     |     │
└──────────────────────────┴──────────────────────────┘
```

#### Cơ Chế Hoạt Động
1. **Chọn Partition Key**: Cột được sử dụng để quyết định dữ liệu vào partition nào (ví dụ: Gender)
2. **Tạo Partitions**: Tạo các bảng riêng biệt cho mỗi giá trị (table_user_01, table_user_02, ...)
3. **Routing Logic**: Application logic xác định query vào partition nào:
   ```
   IF gender == "Nam" THEN query table_user_nam
   ELSE query table_user_nu
   ```

#### Ưu Điểm ✅
- Query nhanh hơn (chỉ quét 50% dữ liệu thay vì 100%)
- Dễ dàng phân tán tải (load balancing)
- Có thể độc lập sao lưu từng partition
- Tính đồng thời cao (ít xung đột khóa)

#### Nhược Điểm ❌
- **Phức tạp logic ứng dụng**: Cần routing logic ở application layer
- **Cross-partition queries** khó: `SELECT * FROM users WHERE gender='Nam' AND department='IT'` cần query cả 2 partitions
- **Phân bố không đều**: Nếu 99% user là Nam, 1% là Nữ → partition không cân bằng
- **Maintenance phức tạp**: Phải quản lý nhiều bảng thay vì 1 bảng

#### Khi Nào Dùng? 🎯
✅ **Nên dùng khi**:
- Có tiêu chí rõ ràng để chia (gender, region, màu sắc, level, ...)
- Dữ liệu phân bố đều qua các partition
- Thường xuyên query với partition key
- Muốn giảm size mỗi partition

❌ **KHÔNG nên dùng khi**:
- Luôn cần query tất cả partitions (ví dụ: báo cáo toàn công ty)
- Dữ liệu phân bố rất không đều
- Cần JOIN phức tạp giữa các partition

#### Ví Dụ Thực Tế
```sql
-- Ứng dụng routing:
IF @gender = 'Nam'
    SELECT * FROM table_user_01 WHERE department = 'IT'
ELSE
    SELECT * FROM table_user_02 WHERE department = 'IT'

-- Hiệu suất:
-- Không partition: quét 10M rows
-- Có partition: quét 5M rows (50% cải thiện)
```

---

### 2️⃣ **Vertical Partitioning** (Phân chia theo cột / Column-based)

#### Định Nghĩa
Chia một bảng thành nhiều bảng nhỏ dựa trên **các cột (attributes)** khác nhau.

#### Mô Hình

```
┌──────────────────────────────────────────────────────────┐
│  Bảng Users gốc (quá rộng - 50 cột)                    │
├──────────────────────────────────────────────────────────┤
│ ID | Name | Age | Email | Phone | Bio | Avatar | Resume │
│    | Company | Position | Salary | ... | (còn nhiều)    │
└──────────────────────────────────────────────────────────┘
        ↓ PHÂN CHIA THEO NHÓM CỘT
┌─────────────────────┬──────────────────────┬──────────────────────┐
│  users_core         │  users_contact       │  users_company       │
│  (Hay truy cập)     │  (Đôi khi)           │  (Ít truy cập)       │
├─────────────────────┼──────────────────────┼──────────────────────┤
│ ID                  │ ID (FK)              │ ID (FK)              │
│ Name                │ Email                │ Company              │
│ Age                 │ Phone                │ Position             │
│ Avatar              │ Address              │ Salary               │
│                     │ City                 │ Joined_Date          │
└─────────────────────┴──────────────────────┴──────────────────────┘
```

#### Cơ Chế Hoạt Động
1. **Phân Tích Truy Vấn**: Xác định nhóm cột nào được truy cập thường xuyên
2. **Nhóm Cột**: Các cột liên quan được nhóm thành bảng riêng (normalize nhưng theo cách khác)
3. **JOIN Khi Cần**: Khi cần thông tin đầy đủ, dùng PRIMARY KEY để JOIN các bảng

#### Ưu Điểm ✅
- **Tối ưu caching**: Bảng nhỏ → vừa trong memory → cache hit rate cao
- **Query nhanh**: `SELECT ID, Name FROM users_core` rất nhanh (bảng nhỏ)
- **Giảm I/O**: Không đọc cột không cần thiết
- **Bảo mật**: Có thể giới hạn quyền truy cập per partition

#### Nhược Điểm ❌
- **Cần JOIN**: Để lấy thông tin đầy đủ, phải JOIN nhiều bảng
- **Phức tạp schema**: Phải quản lý khóa ngoại (FK) giữa các partition
- **Overhead**: JOIN có cost, bù được bằng I/O tiết kiệm
- **Maintenance**: Phải sync dữ liệu giữa các bảng

#### Khi Nào Dùng? 🎯
✅ **Nên dùng khi**:
- Bảng quá rộng (50+ cột)
- Một số cột được truy cập rất thường xuyên (hot columns)
- Các cột khác ít được sử dụng (cold columns)
- Cần tối ưu hóa truy vấn theo column groups

❌ **KHÔNG nên dùng khi**:
- Luôn cần tất cả cột trong mỗi query
- Cột được truy vấn đều ngang nhau
- Số lượng cột tương đối ít (<20 cột)

#### Ví Dụ Thực Tế
```sql
-- Truy vấn nhanh (chỉ cần users_core):
SELECT ID, Name FROM users_core
WHERE Age > 25
-- Quét: 1 bảng nhỏ → 10ms

-- Truy vấn đầy đủ (cần JOIN):
SELECT c.ID, c.Name, ct.Email, cmp.Salary
FROM users_core c
LEFT JOIN users_contact ct ON c.ID = ct.ID
LEFT JOIN users_company cmp ON c.ID = cmp.ID
WHERE c.Age > 25
-- Quét: 3 bảng, cần 2 JOINs → 50ms (vs 100ms không partition)
```

---

### 3️⃣ **Function-Based Partitioning** (Phân chia bằng hàm / Range-based)

#### Định Nghĩa
Database **tự động** chia một bảng thành nhiều phần dựa trên một **hàm (function)** áp dụng trên partition key.

#### Mô Hình - Range Partitioning (Phổ Biến Nhất)

```
┌──────────────────────────────────────────────┐
│  Bảng Orders - 10M records                   │
├──────────────────────────────────────────────┤
│ OrderID | Date       | Amount | Customer    │
│ 1       | 2024-01-15 | 100K   | John        │
│ 2       | 2024-02-20 | 150K   | Jane        │
│ 3       | 2024-03-10 | 200K   | Mike        │
│ 4       | 2024-04-05 | 180K   | Lisa        │
└──────────────────────────────────────────────┘
        ↓ PARTITION FUNCTION (BY MONTH)
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ P_2024_01        │ P_2024_02        │ P_2024_03        │ P_2024_04        │
│ (Jan data)       │ (Feb data)       │ (Mar data)       │ (Apr data)       │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Range: 01-01 to  │ Range: 02-01 to  │ Range: 03-01 to  │ Range: 04-01 to  │
│        01-31     │        02-28     │        03-31     │        04-30     │
│ Size: 2M records │ Size: 2M records │ Size: 2M records │ Size: 2M records │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

#### Cơ Chế Hoạt Động (SQL Server ví dụ)

```sql
-- 1. Tạo PARTITION FUNCTION
CREATE PARTITION FUNCTION pf_OrdersByMonth (DATE)
    AS RANGE LEFT FOR VALUES 
    ('2024-02-01'), ('2024-03-01'), ('2024-04-01'), ...

-- 2. Tạo PARTITION SCHEME (file groups)
CREATE PARTITION SCHEME ps_OrdersByMonth
    AS PARTITION pf_OrdersByMonth
    ALL TO ([PRIMARY])

-- 3. Áp dụng lên bảng
CREATE TABLE Orders (...)
    ON ps_OrdersByMonth(OrderDate)
    -- Database tự động quyết định:
    -- OrderDate='2024-01-15' → Partition 1
    -- OrderDate='2024-02-20' → Partition 2
    -- OrderDate='2024-03-10' → Partition 3
```

#### Partition Elimination (Tối Ưu Tự Động)

```sql
-- Query 1: Query 1 tháng cụ thể
SELECT * FROM Orders 
WHERE OrderDate >= '2024-02-01' AND OrderDate < '2024-03-01'
-- Database thấy: Range [02-01, 03-01) khớp PARTITION 2
-- Chỉ quét Partition 2 → 2M records (vs 10M) → 93% cải thiện!

-- Query 2: Query cả quarter
SELECT * FROM Orders 
WHERE OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01'
-- Database thấy: Range [01-01, 04-01) khớp PARTITION 1-3
-- Quét Partition 1-3 → 6M records (vs 10M) → 40% cải thiện

-- Query 3: Query không có partition key
SELECT * FROM Orders 
WHERE Amount > 150K
-- Database phải quét tất cả partitions
-- Không có lợi ích từ partitioning
```

#### Các Kiểu Function-Based Partitioning

| Kiểu | Hàm | Ví Dụ | Dùng Khi |
|------|-----|-------|---------|
| **RANGE** | Khoảng giá trị | `Date >= '01-01' AND < '02-01'` | Dữ liệu time-series |
| **LIST** | Danh sách cụ thể | `Country IN ('VN', 'TH', 'SG')` | Categorical data |
| **HASH** | Hàm hash | Hash(UserID) % 4 | Phân bố đều |
| **MODULO** | Chia dư | `UserID % 10` | Numeric data |

#### Ưu Điểm ✅
- **Tự động**: Database tự handle, ứng dụng không cần thay đổi code
- **Partition Elimination**: Database tự động skip partitions không cần thiết
- **Efficient**: Rất nhanh cho range queries
- **Easy Maintenance**: Archive old partitions, rebuild individual partitions
- **Transparent to App**: Application không biết partitioning tồn tại

#### Nhược Điểm ❌
- **Cần database support**: Không phải tất cả DB support (PostgreSQL yêu cầu extension)
- **Partition Key không đổi**: Phải chọn đúng partition key từ đầu
- **Dynamic partitions phức tạp**: Thêm partition mới cần SQL statements
- **Cơ sở dữ liệu specific**: Schema khác nhau giữa SQL Server, Oracle, PostgreSQL

#### Khi Nào Dùng? 🎯
✅ **Nên dùng khi**:
- Dữ liệu time-series (Orders, Logs, Events, Transactions)
- Thường query theo range (ngày, tháng, quý)
- Cần archive dữ liệu cũ
- Cần automatic partition management
- Database support native partitioning

❌ **KHÔNG nên dùng khi**:
- Dùng file-based databases (SQLite, CSV)
- Partition key hay thay đổi
- Cần complex cross-partition logic

#### Ví Dụ Thực Tế
```sql
-- Setup (một lần):
CREATE PARTITION FUNCTION pf_ByMonth (DATE)
    AS RANGE LEFT FOR VALUES
    ('2024-02-01'), ('2024-03-01'), ..., ('2024-12-01')

-- Sử dụng (query bình thường):
-- Tháng 2:
SELECT * FROM Orders WHERE CreatedDate BETWEEN '2024-02-01' AND '2024-02-28'
-- → Tự động query partition 2 only → 10x nhanh hơn

-- Maintenance (xóa partition cũ):
ALTER PARTITION FUNCTION pf_ByMonth()
    SPLIT RANGE ('2025-01-01')  -- Thêm partition mới
```

---

## 📋 So Sánh Ba Loại Partitioning

| Tiêu Chí | Horizontal | Vertical | Function-Based |
|----------|-----------|----------|-----------------|
| **Partition Key** | 1 cột (gender, region) | Nhóm cột | 1 cột (date, modulo) |
| **Chia Theo** | Hàng (Row) | Cột (Column) | Hàm logic |
| **Routing** | Application | Application | Database (auto) |
| **Khi Dùng** | Categorical data | Hot/cold columns | Time-series data |
| **Query Nhanh** | filtered queries | Column-specific | Range queries |
| **Query Chậm** | Cross-partition | JOIN all partitions | Non-partition queries |
| **Độ Phức Tạp** | ⭐⭐ Code | ⭐⭐⭐ JOINs | ⭐⭐⭐⭐ SQL |
| **Hiệu Suất** | 50% (~2x) | 70% (~3x) | 90%+ (~10x) |

---

## 🎓 Bài Học Chính

### 1. Hiểu Về Trade-off
```
┌─────────────────────────────────────────────────────────┐
│ Tất cả partitioning đều có trade-off:                  │
├─────────────────────────────────────────────────────────┤
│ ✓ Một số query nhanh hơn                               │
│ ✗ Các query khác chậm hơn (nhiều partition)            │
│ ✗ Quảng lý phức tạp hơn                                │
│ ✗ Ứng dụng phức tạp hơn                                │
└─────────────────────────────────────────────────────────┘
```

### 2. Partition Key Rất Quan Trọng
- Phải xuất hiện trong WHERE clause thường xuyên
- Phải phân bố dữ liệu đều
- Khó thay đổi sau khi implement

### 3. Partition Elimination (Chuỗi Vàng)
```sql
-- LỢI: PARTITION ELIMINATION (Horizontal + Function)
SELECT * FROM orders WHERE date='2024-01-15'
  → Quét 1 partition (nếu 1 tháng = 1 partition)

-- CÓ HẠI: Không có partition elimination
SELECT * FROM orders WHERE customer_name='John'
  → Quét tất cả partitions (customer_name không phải partition key)
```

### 4. Khoảng Cách Giữa Lý Thuyết & Thực Tế
| Lý Thuyết | Thực Tế |
|-----------|---------|
| Luôn chọn đúng partition key | Khó xác định từ đầu, cần monitoring |
| Dữ liệu phân bố hoàn hảo | Thường không cân bằng |
| Partitioning là solution | Cần kết hợp: indexes, caching, archival |
| 1 loại partitioning | Thường cần kết hợp (horizontal + vertical) |

---

## 📁 Cấu Trúc Danh Mục Học Tập

```
Bai2/  ← Bài Tập Lý Thuyết
├── README.md (file này)
│
├── 1_horizontal-partition/
│   ├── README.md           ← Giải thích chi tiết + VD
│   ├── setup.sql           ← Schema SQL (tham khảo)
│   ├── sample-data.sql     ← Dữ liệu ví dụ (tham khảo)
│   └── queries.sql         ← Các truy vấn ví dụ (tham khảo)
│
├── 2_vertical-partition/
│   ├── README.md           ← Giải thích chi tiết + VD
│   ├── setup.sql           ← Schema SQL (tham khảo)
│   └── queries.sql         ← Các truy vấn ví dụ (tham khảo)
│
├── 3_function-partition/
│   ├── README.md           ← Giải thích chi tiết + VD
│   └── queries.sql         ← Các truy vấn ví dụ (tham khảo)
│
└── PERFORMANCE_ANALYSIS.md ← Phân tích hiệu suất chi tiết
```

---

## 📊 So Sánh Hiệu Năng Chi Tiết

### Kịch Bản 1: Query Không Dùng Partition Key
```sql
-- Câu hỏi: Tìm tất cả user từ phòng IT

-- KHÔNG PARTITION:
SELECT * FROM users WHERE department = 'IT'
├─ Quét: 10M rows toàn bộ
├─ Time: 100ms
└─ I/O: 1000 units

-- HORIZONTAL (by gender):
SELECT * FROM table_user_nam WHERE department = 'IT'
UNION ALL
SELECT * FROM table_user_nu WHERE department = 'IT'
├─ Quét: 10M rows (cả 2 partitions)
├─ Time: 105ms  (HƠn 5% do overhead JOIN)
└─ I/O: 1050 units ❌ (MÃT hiệu suất!)
```

### Kịch Bản 2: Query Dùng Partition Key
```sql
-- Câu hỏi: Tìm tất cả user Nam

-- KHÔNG PARTITION:
SELECT * FROM users WHERE gender = 'Nam'
├─ Quét: 10M rows
├─ Time: 100ms
└─ I/O: 1000 units

-- HORIZONTAL (by gender):
SELECT * FROM table_user_nam
├─ Quét: 5M rows (partition 1)
├─ Time: 50ms ✅ (50% nhanh hơn!)
└─ I/O: 500 units
```

### Kịch Bản 3: function-based (Range Query)
```sql
-- Câu hỏi: Tìm order tháng 2/2024

-- KHÔNG PARTITION:
SELECT * FROM orders WHERE order_date >= '2024-02-01' AND < '2024-03-01'
├─ Quét: 10M rows toàn bộ + filter
├─ Time: 1000ms
└─ I/O: 10,000 units

-- FUNCTION-BASED (Monthly partition):
SELECT * FROM orders WHERE order_date >= '2024-02-01' AND < '2024-03-01'
├─ Partition Elimination: Chỉ quét P_2024_02
├─ Quét: 1M rows (partition 2 only)
├─ Time: 50ms ✅ (20x nhanh hơn!)
└─ I/O: 1000 units
```

---

## 🎓 Lộ Trình Học Tập (3-5 Tiếng)

### Giai Đoạn 1: HIỂU CƠ BẢN (30 phút)
1. Đọc phần này (README)
2. Hiểu khái niệm 3 loại partitioning
3. Hiểu vì sao cần partitioning

**Kiểm Tra**: Bạn có thể giải thích sự khác nhau giữa Horizontal vs Vertical vs Function-based?

### Giai Đoạn 2: HIỂU SÂU (2 giờ)
1. Đọc [1_horizontal-partition/README.md](1_horizontal-partition/README.md) - 30 phút
2. Đọc [2_vertical-partition/README.md](2_vertical-partition/README.md) - 30 phút
3. Đọc [3_function-partition/README.md](3_function-partition/README.md) - 30 phút
4. Học SQL examples trong mỗi thư mục - 30 phút

**Kiểm Tra**: Vẽ được sơ đồ schema cho mỗi loại partitioning?

### Giai Đoạn 3: VÍ DỤ THỰC TẾ (1.5 giờ)
1. Đọc [PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md) - 1 giờ
2. So sánh performance các loại partitioning - 30 phút

**Kiểm Tra**: Biết khi nào nên dùng Horizontal vs Vertical vs Function-based?

---

## ❓ Phần Thường Hỏi (FAQ)

### Q1: Cái nào là thuật toán partitioning?
**A**: Partitioning **KHÔNG** phải thuật toán. Nó là **kỹ thuật thiết kế hệ thống**. Là cách chia dữ liệu để tối ưu hóa để truy cập.

### Q2: Có thể dùng nhiều partitioning strategy cùng lúc không?
**A**: **CÓ**! Gọi là **Composite Partitioning**:
```
Horizontal (by gender) + Function-based (by date)
= Chia dữ liệu theo 2 tiêu chí
```

### Q3: Làm sao chọn Partition Key?
**A**: Tiêu chí chọn Partition Key:
1. **Xuất hiện trong WHERE clause thường xuyên**
2. **Distributed evenly** - không bị lệch
3. **Không thay đổi** sau khi insert
4. **Không NULL**

### Q4: Sao không partition mọi bảng?
**A**: Vì partitioning có **chi phí**:
- ❌ Ứng dụng phức tạp hơn
- ❌ Maintenance khó hơn
- ❌ Query không dùng partition key chậm hơn
- ❌ Only hiệu quả với **bảng lớn** (1M+ rows)

**→ Partitioning chỉ dùng khi** bảng quá lớn (slow query) **VÀ** có rõ ràng partition key.

### Q5: Partitioning có giống Sharding không?
**A**: **KHÔNG!** Khác hoàn toàn:

| Tiêu Chí | Partitioning | Sharding |
|----------|-------------|---------|
| **Tầng** | Single DB | Multiple DBs |
| **Scale** | Vertical | Horizontal |
| **Quản lý** | 1 máy | Nhiều máy |
| **Complexity** | Trung bình | Rất cao |
| **Ví dụ** | Gender → 2 tables | UserID → 4 servers |

### Q6: Có thể thay đổi Partition Key sau đó không?
**A**: **Kỹ thuật có thể** nhưng **rất phức tạp**:
1. Tạo bảng mới với partition key khác
2. Copy dữ liệu (có thể mất hàng giờ)
3. Drop bảng cũ
4. Rename bảng mới

→ **Phải lên kế hoạch tốt từ lúc thiết kế!**

### Q7: SQL vs NoSQL có partitioning không?
**A**: **Cả hai đều có**:
- **SQL**: Partitioning (cấu hình), Sharding (phân tán)
- **NoSQL**: Sharding (native), Partitioning (native)
  - ví dụ: MongoDB = Sharding, Cassandra = Partitioning

### Q8: Khi nào performance không cải thiện với partitioning?
**A**: Khi:
1. **Query không dùng partition key**
   ```sql
   SELECT * FROM users WHERE name='John'  -- Quét tất cả partitions
   ```
2. **Partition quá nhỏ** - overhead > lợi ích
3. **Dữ liệu phân bố không đều**
   ```
   Partition 1 (Nam): 9M rows
   Partition 2 (Nữ): 1M rows
   → Query 'Nam' không được cải thiện nhiều
   ```
4. **Kiểu query khác nhau** - một partition key phù hợp một loại query

---

## � Bảng Quyết Định: Chọn Loại Partitioning Nào?

```
                           ┌─ Data quá lớn? (1M+ rows)
                           │
                    YES ────┤
                           │
                           ├─ Có partition key rõ ràng?
                           │  
        ┌──────────────────┴─────────────────────┐
        │                                        │
       YES                                      NO
        │                                        │
        ▼                                        ▼
   Có partition key                      Cần optimize khác
        │                                (cache, indexes, etc)
        │
   Loại partition key?
        │
   ┌────┼────┬──────────────┐
   │    │    │              │
  Gender Region DateTime    Bytes
   │    │    │              │
   ▼    ▼    ▼              ▼
   ┌─────────────────────────────────────┐
   │ HORIZONTAL                          │
   │ - Tách từng giá trị               │
   │ - table_user_nam, table_user_nu   │
   │ - Unicef: 50% cải thiện             │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ FUNCTION-BASED                      │
   │ - Range/modulo/hash                 │
   │ - P_2024_01, P_2024_02, ...         │
   │ - Benefit: 90%+ cải thiện (range)   │
   └─────────────────────────────────────┘

 Bảng quá RỘNG? (50+ cột)
        │
       YES ────► VERTICAL PARTITIONING
        │        - users_core, users_contact
        │        - Benefit: 70% cải thiện (col-specific)
        │
       NO ─────► Cân nhắc thêm
```

### Decision Tree - Quyết Định Chi Tiết

#### Horizontal Partitioning Khi:
✅ NÊN dùng:
- Bảng có 100M+ rows
- Partition key không phải số tăng dần (gender, region, level)
- Query thường có WHERE với partition key
- Dữ liệu chia đều qua partitions
- Muốn load balancing (phân tán task)

❌ KHÔNG nên:
- Thường query cross-partition (report toàn công ty)
- Dữ liệu rất không cân bằng (99% female, 1% male)
- Query chủ yếu không dùng partition key

**Ví dụ**: user table by gender, order table by region, log table by level

---

#### Vertical Partitioning Khi:
✅ NÊN dùng:
- Bảng có 50+ cột
- Một số cột access thường xuyên, cột khác ít khi
- GROUP cột tự nhiên (core info, contact, company)
- JOIN xảng thường (không random)
- Muốn tha ho cache efficiency

❌ KHÔNG nên:
- Cột < 20 cột
- Luôn cần tất cả cột
- Cột access pattern không distinct
- Rất nhiều JOIN requirements

**Ví dụ**: User table (users_core, users_contact), Product table (prod_basic, prod_inventory, prod_reviews)

---

#### Function-Based Partitioning Khi:
✅ NÊN dùng:
- Dữ liệu time-series (Orders, Logs, Events)
- Range queries phổ biến (month, quarter, year)
- Database support native partitioning
- Cần archive dữ liệu cũ
- Query luôn dùng partition key (date)

❌ KHÔNG nên:
- Dùng SQLite/file-based DB (không support)
- Partition key hay thay đổi
- Cần dynamic partitioning (add/remove often)
- Query không consistent dùng partition key

**Ví dụ**: Invoice table by month, Transaction log by date, Event table by week

---

## 📈 Xu Hướng & Thực Tiễn

### Composite Partitioning (Kết Hợp)
Thực tế, các hệ thống lớn thường dùng **cả 2-3 loại**:

```
Scenario: E-commerce platform

Bảng Orders (500M rows):
├─ Horizontal: by region
│  ├─ orders_asia (200M)
│  └─ orders_europe (300M)
│
├─ Function-based: by date (monthly)
│  ├─ orders_202401 (50M each month)
│  └─ orders_202402
│
└─ Vertical: tách columns
   ├─ orders_core (order_id, date, customer_id, status)
   ├─ orders_payment (amount, method, gateway_transaction_id)
   └─ orders_shipping (address, courier, tracking)

Result:
- Tìm đơn hàng Nam Kỳ tháng 1 = very specific partition → 2M rows vs 500M
- Tìm thanh toán tất cả = vertical partition (payment table only) → 50M vs 500M
- Hiệu suất: 250x cải thiện trong best case!
```

### Anti-Patterns (Cái Nên Tránh)

❌ **TRÁNH**: Partitioning dựa trên không rõ ràng partition key
```sql
-- BAD: Partition key không có trong WHERE clause
CREATE TABLE users (id INT PRIMARY KEY, ...)
PARTITION BY HASH(RAND())  -- ❌ Vô nghĩa!
```

❌ **TRÁNH**: Quá nhiều partitions
```
10 triệu rows → 1000 partitions
= Mỗi partition 10K rows
= Overhead lớn, lợi ích nhỏ
```

❌ **TRÁNH**: Partitioning trên cột NULL
```sql
-- BAD: Gender column có NULL
SELECT * FROM users WHERE gender = 'Nam'
-- SQL Server tạo partition cho NULL → confusion
```

✅ **TỐTÝ Nhất Practices**:
1. Đợi để xác định performance issue mới partition
2. Monitor performance TRƯỚC & SAU khi partition
3. Test query plán execution trước khi deploy
4. Archive/delete old partitions thường xuyên
5. Dùng consistent partition key (không thay đổi)

---

## 💡 Các Khái Niệm Liên Quan

### 1. Partitioning vs Sharding
```
PARTITIONING                         SHARDING
├─ Single Database                   ├─ Multiple Databases
├─ Logical separation                ├─ Physical separation
├─ Ứng dụng view 1 table             ├─ Ứng dụng biết nhiều servers
└─ Easy: SQL query bình thường        └─ Phức tạp: distributed logic
```

### 2. Indexing vs Partitioning
```
INDEX                               PARTITIONING
├─ B-tree structure                 ├─ Physical table split
├─ Speed up specific columns        ├─ Speed up data access
├─ Can add multiple indexes         ├─ Limited partition keys
└─ Good for WHERE + ORDER BY        └─ Best cho range queries
```

### 3. Partition Key vs Clustering Key
```
PARTITION KEY (Horizontal/Function)  CLUSTERING KEY (Index)
├─ Xiaoánh định partition con        ├─ Xiaoánh định row order
├─ Một cột (thường)                  ├─ Một hoặc nhiều cột
├─ Quyết định table/filegroup        ├─ Quyết định phaginal order
```

---

## 🔬 Phân Tích Chi Tiết

### Storage Overhead

```
Scenario: 1 million users

KHÔNG PARTITION:
├─ 1 bảng: 1 primary key
├─ 1 clustered index
├─ Size: 100MB data + 50MB index = 150MB

HORIZONTAL (gender):
├─ 2 bảng: 1 PK mỗi bảng
├─ 2 clustered indexes
├─ Size: 100MB data + 55MB index = 155MB ️(0.3% overhead)

VERTICAL (3 bảng):
├─ 3 bảng: 1 PK trên bảng + FK pada tables khác  
├─ 3 clustered indexes + FK indexes
├─ Size: 100MB data + 65MB index = 165MB ⬆️ (10% overhead)

FUNCTION-BASED (12 monthly):
├─ 12 partitions, 1 logical table
├─ Index này phải partitioned cũng
├─ Size: 100MB data + 60MB index = 160MB (minimal overhead)
```

### Overhead Chi Phí (Implementation)

| Aspekt | Horizontal | Vertical | Function |
|--------|-----------|----------|----------|
| Code Complexity | Medium | Medium | Low |
| Query Routing | Manual | Manual | Automatic |
| Schema Complexity | Low | High (FK) | Medium |
| Maintenance | Manual | Manual | Automatic |
| Monitoring | Required | Required | Quick |
| Learning Time | 1 day | 2 days | 3 days |

---

## 🎯 Kết Luận

### Khi Nào KHÔNG Partition
```
Rule of Thumb:
├─ Bảng < 1 triệu rows? → KHÔNG partition
├─ Query đã nhanh? → KHÔNG partition
├─ Không rõ partition key? → KHÔNG partition
└─ Bảng nhỏ < 100MB? → KHÔNG partition
```

### Khi Nào Partition
```
Rule of Thumb:
├─ Bảng > 100 triệu rows? → Cân nhắc partition
├─ Slow query reports?Q → Thử partition
├─ Rõ partition key? → Có thể partition
├─ Load balancing cần? → Partition
└─ Archive old data? → Function partition
```

### Performance Expectation
```
Gains Range (Best Case):
├─ Horizontal: 30-60% cải thiện
├─ Vertical: 50-80% cải thuận (col-specific queries)
└─ Function-based: 70-95% cải thiện (range queries)

Reality:
├─ Average: 20-40% (vì không phải query nào cũng ideal)
├─ Worst case: -10% (query cross-partition slows down)
└─ Breakdown: Partition key must ở WHERE clause
```

---

## 📋 Checklist - Trước Khi Partition

- [ ] Bảng lớn hơn 100MB?
- [ ] Slow query analysis đã làm?
- [ ] Index strategy đã tối ưu?
- [ ] Partition key rõ ràng?
- [ ] Dữ liệu chia đều?
- [ ] Team có skills?
- [ ] Backup strategy có?
- [ ] Querunsitoring plan có?

---

## 🔗 Tài Liệu Liên Quan

### Đọc Thêm Trong Bai2
1. [1_horizontal-partition/README.md](1_horizontal-partition/README.md) - Chi tiết Horizontal
2. [2_vertical-partition/README.md](2_vertical-partition/README.md) - Chi tiết Vertical
3. [3_function-partition/README.md](3_function-partition/README.md) - Chi tiết Function
4. [PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md) - Phân tích hiệu suất

### Một Số Ví Dụ SQL
- `1_horizontal-partition/setup.sql` - Schema gender partitioniing
- `1_horizontal-partition/queries.sql` - 10 query examples
- `2_vertical-partition/queries.sql` - JOIN examples
- `3_function-partition/queries.sql` - Range query examples

---

## ✨ Tóm Tắt

**Database Partitioning** là kỹ thuật chia bảng lớn thành các phần nhỏ để:
1. Giảm I/O (quét ít dữ liệu hơn)
2. Cải thiện cache (bảng nhỏ vừa trong RAM)
3. Dễ maintenance (rebuild index nhanh hơn)
4. Khả năng mở rộng (thêm partition mới)

**3 Loại Chính**:
- **Horizontal**: Chia theo hàng (gender, region) → 50% cải thiện
- **Vertical**: Chia theo cột (core, contact) → 70% cải thiện (selective queries)
- **Function-based**: Database tự động (by date) → 90%+ cải thiện (range queries)

**Chọn kỹ**: Phải có clear partition key, dữ liệu chia đều, query thường dùng partition key.

**Thường dùng kết hợp**: Horizontal + Function, Vertical + Index, Composite strategies.

---

**Status**: ✅ Lý Thuyết Hoàn Chỉnh  
**Độ Khó**: Trung Bình (hiểu được với SQL + DB基础)  
**Thời Gian**: 3-5 giờ học tập  
**Kỹ Năng**: Database Design, SQL, Performance Optimization

👉 **BẮTĐẦU**: Đọc [1_horizontal-partition/README.md](1_horizontal-partition/README.md)
