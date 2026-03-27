-- ========== SAMPLE DATA INSERTION ==========
-- Insert sample data into horizontal partitioned tables

USE PartitioningDB;
GO

-- ========== INSERT NAM USERS (table_user_01) ==========
INSERT INTO table_user_01 (name, email, gender, age, city, phone, salary, department, hire_date)
VALUES
    ('Nguyễn Văn A', 'nguyenvana@gmail.com', 'Nam', 25, 'Hà Nội', '0912345678', 15000000, 'IT', '2022-01-15'),
    ('Trần Văn B', 'tranvanb@gmail.com', 'Nam', 30, 'TP HCM', '0923456789', 18000000, 'Sales', '2021-05-20'),
    ('Lê Văn C', 'levanc@gmail.com', 'Nam', 28, 'Đà Nẵng', '0934567890', 16000000, 'IT', '2021-10-10'),
    ('Phạm Văn D', 'phamvand@gmail.com', 'Nam', 35, 'Hải Phòng', '0945678901', 20000000, 'Management', '2020-03-01'),
    ('Dương Văn E', 'duongvane@gmail.com', 'Nam', 26, 'Hà Nội', '0956789012', 15500000, 'IT', '2022-07-30'),
    ('Hoàng Văn F', 'hoangvanf@gmail.com', 'Nam', 32, 'Hà Nội', '0967890123', 19000000, 'HR', '2020-11-15'),
    ('Vũ Văn G', 'vuvang@gmail.com', 'Nam', 27, 'TP HCM', '0978901234', 16500000, 'Finance', '2022-02-20'),
    ('Bùi Văn H', 'buivanh@gmail.com', 'Nam', 31, 'Đà Nẵng', '0989012345', 17500000, 'Sales', '2021-06-10'),
    ('Tô Văn I', 'tovani@gmail.com', 'Nam', 24, 'Hà Nội', '0990123456', 14000000, 'IT', '2023-01-05'),
    ('Cao Văn J', 'caovanj@gmail.com', 'Nam', 29, 'TP HCM', '0901234567', 17000000, 'IT', '2021-09-12'),
    ('Đỗ Văn K', 'dovank@gmail.com', 'Nam', 33, 'Hải Phòng', '0912345679', 19500000, 'Management', '2020-04-20'),
    ('Nô Văn L', 'novanl@gmail.com', 'Nam', 26, 'Hà Nội', '0923456790', 15200000, 'Finance', '2022-08-15');

GO

-- ========== INSERT NỮ USERS (table_user_02) ==========
INSERT INTO table_user_02 (name, email, gender, age, city, phone, salary, department, hire_date)
VALUES
    ('Nguyễn Thị F', 'nguyenthif@gmail.com', 'Nữ', 24, 'Hà Nội', '0967890123', 14500000, 'HR', '2022-03-10'),
    ('Trần Thị G', 'tranthig@gmail.com', 'Nữ', 29, 'TP HCM', '0978901234', 17000000, 'Sales', '2021-07-25'),
    ('Lê Thị H', 'lethih@gmail.com', 'Nữ', 27, 'Đà Nẵng', '0989012345', 16000000, 'Finance', '2022-01-20'),
    ('Phạm Thị I', 'phamthi@gmail.com', 'Nữ', 32, 'Hải Phòng', '0990123456', 18500000, 'IT', '2020-09-05'),
    ('Dương Thị J', 'duongthij@gmail.com', 'Nữ', 23, 'Hà Nội', '0901234567', 13500000, 'Sales', '2023-05-15'),
    ('Hoàng Thị K', 'hoangthik@gmail.com', 'Nữ', 31, 'Hà Nội', '0912345678', 18000000, 'Management', '2020-12-01'),
    ('Vũ Thị L', 'vuthil@gmail.com', 'Nữ', 25, 'TP HCM', '0923456789', 15000000, 'IT', '2022-04-10'),
    ('Bùi Thị M', 'buithim@gmail.com', 'Nữ', 30, 'Đà Nẵng', '0934567890', 17500000, 'Finance', '2021-08-20'),
    ('Tô Thị N', 'tothin@gmail.com', 'Nữ', 26, 'Hà Nội', '0945678901', 15500000, 'IT', '2022-06-05'),
    ('Cao Thị O', 'caothio@gmail.com', 'Nữ', 28, 'TP HCM', '0956789012', 16500000, 'HR', '2021-10-30'),
    ('Đỗ Thị P', 'dothip@gmail.com', 'Nữ', 34, 'Hải Phòng', '0967890124', 19000000, 'Management', '2020-05-10'),
    ('Nô Thị Q', 'nothiq@gmail.com', 'Nữ', 22, 'Hà Nội', '0978901235', 13000000, 'Sales', '2023-02-20');

GO

PRINT '✓ Successfully inserted sample data!';
PRINT 'table_user_01: 12 Nam users';
PRINT 'table_user_02: 12 Nữ users';
PRINT 'Total: 24 users';
