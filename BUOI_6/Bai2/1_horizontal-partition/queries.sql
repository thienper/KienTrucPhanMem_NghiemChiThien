-- ========== QUERY EXAMPLES FOR HORIZONTAL PARTITIONING ==========
-- Learn how to query horizontally partitioned tables efficiently

USE PartitioningDB;
GO

PRINT '========== QUERY 1: Get all Nam users ==========';
GO

-- Query only the Nam partition (table_user_01)
SELECT 
    user_id, 
    name, 
    email, 
    age, 
    city, 
    salary, 
    department
FROM table_user_01
ORDER BY created_at DESC;

GO

PRINT '========== QUERY 2: Get all Nữ users ==========';
GO

SELECT 
    user_id, 
    name, 
    email, 
    age, 
    city, 
    salary, 
    department
FROM table_user_02
ORDER BY created_at DESC;

GO

PRINT '========== QUERY 3: Get Nam users in Hà Nội ==========';
GO

-- ✅ GOOD! Uses partition key (gender)
-- Only scans table_user_01 partition!
SELECT 
    user_id, 
    name, 
    email, 
    age, 
    salary,
    department
FROM table_user_01
WHERE city = 'Hà Nội'
ORDER BY name;

GO

PRINT '========== QUERY 4: Get Nữ users by department (IT) ==========';
GO

SELECT 
    user_id, 
    name, 
    email, 
    age, 
    salary,
    department
FROM table_user_02
WHERE department = 'IT'
ORDER BY salary DESC;

GO

PRINT '========== QUERY 5: Statistics - Count users by gender ==========';
GO

SELECT 
    'Nam' AS gender,
    COUNT(*) AS total_users,
    CAST(AVG(CAST(age AS FLOAT)) AS DECIMAL(5,2)) AS avg_age,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary,
    CAST(AVG(salary) AS DECIMAL(10,2)) AS avg_salary,
    COUNT(DISTINCT city) AS unique_cities,
    COUNT(DISTINCT department) AS unique_departments
FROM table_user_01

UNION ALL

SELECT 
    'Nữ' AS gender,
    COUNT(*) AS total_users,
    CAST(AVG(CAST(age AS FLOAT)) AS DECIMAL(5,2)) AS avg_age,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary,
    CAST(AVG(salary) AS DECIMAL(10,2)) AS avg_salary,
    COUNT(DISTINCT city) AS unique_cities,
    COUNT(DISTINCT department) AS unique_departments
FROM table_user_02;

GO

PRINT '========== QUERY 6: Query all partitions (UNION) ==========';
GO

-- ⚠️ When you need to search across all gender
SELECT 
    user_id, 
    name, 
    email, 
    gender,
    age, 
    city,
    salary,
    department
FROM table_user_01
UNION ALL
SELECT 
    user_id, 
    name, 
    email, 
    gender,
    age, 
    city,
    salary,
    department
FROM table_user_02
WHERE salary > 16000000  -- High salary earners
ORDER BY salary DESC;

GO

PRINT '========== QUERY 7: Partition size analysis ==========';
GO

-- Monitor partition sizes for load balancing
SELECT 
    'table_user_01' AS partition_name,
    COUNT(*) AS row_count,
    CAST((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM table_user_01 WHERE 1=1)) AS DECIMAL(5,2)) AS percentage_of_nam,
    COUNT(DISTINCT city) AS unique_cities,
    COUNT(DISTINCT department) AS unique_departments
FROM table_user_01

UNION ALL

SELECT 
    'table_user_02' AS partition_name,
    COUNT(*) AS row_count,
    CAST((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM table_user_02 WHERE 1=1)) AS DECIMAL(5,2)) AS percentage_of_nu,
    COUNT(DISTINCT city) AS unique_cities,
    COUNT(DISTINCT department) AS unique_departments
FROM table_user_02;

GO

PRINT '========== QUERY 8: Users by city (partition + filter) ==========';
GO

-- Get cities distribution by gender
SELECT 
    'Nam' AS gender,
    city,
    COUNT(*) AS user_count,
    CAST(AVG(salary) AS DECIMAL(10,2)) AS avg_salary
FROM table_user_01
GROUP BY city
ORDER BY user_count DESC

UNION ALL

SELECT 
    'Nữ' AS gender,
    city,
    COUNT(*) AS user_count,
    CAST(AVG(salary) AS DECIMAL(10,2)) AS avg_salary
FROM table_user_02
GROUP BY city
ORDER BY user_count DESC;

GO

PRINT '========== QUERY 9: Department analysis by gender ==========';
GO

-- Compare department distribution between genders
SELECT 
    'Nam' AS gender,
    department,
    COUNT(*) AS user_count,
    CAST(AVG(salary) AS DECIMAL(10,2)) AS avg_salary,
    MIN(age) AS min_age,
    MAX(age) AS max_age
FROM table_user_01
GROUP BY department
ORDER BY user_count DESC, avg_salary DESC

UNION ALL

SELECT 
    'Nữ' AS gender,
    department,
    COUNT(*) AS user_count,
    CAST(AVG(salary) AS DECIMAL(10,2)) AS avg_salary,
    MIN(age) AS min_age,
    MAX(age) AS max_age
FROM table_user_02
GROUP BY department
ORDER BY user_count DESC, avg_salary DESC;

GO

PRINT '========== QUERY 10: Top earners by partition ==========';
GO

-- Top 5 earners in each gender category
SELECT TOP 5
    user_id,
    name,
    'Nam' AS gender,
    salary,
    department,
    city
FROM table_user_01
ORDER BY salary DESC

UNION ALL

SELECT TOP 5
    user_id,
    name,
    'Nữ' AS gender,
    salary,
    department,
    city
FROM table_user_02
ORDER BY salary DESC;

GO

PRINT '========== Stored Procedure Examples ==========';
GO

-- Example 1: Get Nam users
EXEC sp_GetUsersByGender @gender = 'Nam', @city = 'Hà Nội';

GO

-- Example 2: Get all users (both genders)
EXEC sp_GetAllUsers @city = NULL;

GO

-- Example 3: Count by gender
EXEC sp_CountByGender;

GO

PRINT '✓ All queries executed successfully!';
