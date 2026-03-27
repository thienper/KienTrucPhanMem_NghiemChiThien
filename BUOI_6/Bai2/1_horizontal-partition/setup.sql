-- ========== HORIZONTAL PARTITIONING SETUP ==========
-- SQL Server Database Setup for Gender-based Partitioning
-- Run this file to create database and tables

-- Create Database
CREATE DATABASE PartitioningDB;
GO

-- Use the database
USE PartitioningDB;
GO

-- ========== CREATE TABLES FOR HORIZONTAL PARTITIONING ==========

-- Table 1: Nam Users Partition
CREATE TABLE table_user_01 (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    gender CHAR(3) NOT NULL DEFAULT 'Nam',
    age INT,
    city NVARCHAR(50),
    phone NVARCHAR(20),
    salary DECIMAL(10,2),
    department NVARCHAR(50),
    hire_date DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    INDEX idx_gender NONCLUSTERED (gender),
    INDEX idx_email NONCLUSTERED (email),
    INDEX idx_city NONCLUSTERED (city),
    INDEX idx_department NONCLUSTERED (department)
);

GO

-- Table 2: Nữ Users Partition
CREATE TABLE table_user_02 (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    gender CHAR(3) NOT NULL DEFAULT 'Nữ',
    age INT,
    city NVARCHAR(50),
    phone NVARCHAR(20),
    salary DECIMAL(10,2),
    department NVARCHAR(50),
    hire_date DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    INDEX idx_gender NONCLUSTERED (gender),
    INDEX idx_email NONCLUSTERED (email),
    INDEX idx_city NONCLUSTERED (city),
    INDEX idx_department NONCLUSTERED (department)
);

GO

-- Base View: Combine all partitions (for UNION ALL queries)
CREATE VIEW vw_users AS
SELECT * FROM table_user_01
UNION ALL
SELECT * FROM table_user_02;

GO

-- Stored Procedure: Insert user to correct partition based on gender
CREATE PROCEDURE sp_InsertUser
    @name NVARCHAR(100),
    @email NVARCHAR(100),
    @gender CHAR(3),
    @age INT,
    @city NVARCHAR(50),
    @phone NVARCHAR(20),
    @salary DECIMAL(10,2),
    @department NVARCHAR(50),
    @hire_date DATETIME
AS
BEGIN
    IF @gender = 'Nam'
    BEGIN
        INSERT INTO table_user_01 (name, email, gender, age, city, phone, salary, department, hire_date)
        VALUES (@name, @email, @gender, @age, @city, @phone, @salary, @department, @hire_date);
    END
    ELSE IF @gender = 'Nữ'
    BEGIN
        INSERT INTO table_user_02 (name, email, gender, age, city, phone, salary, department, hire_date)
        VALUES (@name, @email, @gender, @age, @city, @phone, @salary, @department, @hire_date);
    END
    ELSE
    BEGIN
        RAISERROR('Invalid gender. Must be Nam or Nữ', 16, 1);
    END
END;

GO

-- Stored Procedure: Get users by gender
CREATE PROCEDURE sp_GetUsersByGender
    @gender CHAR(3),
    @city NVARCHAR(50) = NULL
AS
BEGIN
    IF @gender = 'Nam'
    BEGIN
        SELECT * FROM table_user_01
        WHERE (@city IS NULL OR city = @city)
        ORDER BY created_at DESC;
    END
    ELSE IF @gender = 'Nữ'
    BEGIN
        SELECT * FROM table_user_02
        WHERE (@city IS NULL OR city = @city)
        ORDER BY created_at DESC;
    END
    ELSE
    BEGIN
        RAISERROR('Invalid gender', 16, 1);
    END
END;

GO

-- Stored Procedure: Get all users (UNION)
CREATE PROCEDURE sp_GetAllUsers
    @city NVARCHAR(50) = NULL
AS
BEGIN
    SELECT * FROM table_user_01
    WHERE (@city IS NULL OR city = @city)
    UNION ALL
    SELECT * FROM table_user_02
    WHERE (@city IS NULL OR city = @city)
    ORDER BY created_at DESC;
END;

GO

-- Stored Procedure: Count users by gender
CREATE PROCEDURE sp_CountByGender
AS
BEGIN
    SELECT 
        'Nam' AS gender,
        COUNT(*) AS total_users,
        CAST(AVG(CAST(age AS FLOAT)) AS DECIMAL(5,2)) AS avg_age,
        COUNT(DISTINCT city) AS unique_cities
    FROM table_user_01
    
    UNION ALL
    
    SELECT 
        'Nữ' AS gender,
        COUNT(*) AS total_users,
        CAST(AVG(CAST(age AS FLOAT)) AS DECIMAL(5,2)) AS avg_age,
        COUNT(DISTINCT city) AS unique_cities
    FROM table_user_02;
END;

GO

PRINT 'Database PartitioningDB created successfully!';
PRINT 'Tables: table_user_01, table_user_02';
PRINT 'Stored Procedures: sp_InsertUser, sp_GetUsersByGender, sp_GetAllUsers, sp_CountByGender';
