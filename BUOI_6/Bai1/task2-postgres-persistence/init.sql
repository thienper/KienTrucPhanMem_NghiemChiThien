-- ========== Initialize PostgreSQL Database ==========
-- Note: Database app_db is already created by POSTGRES_DB env variable
-- in docker-compose.yml, so we just connect to it and create tables

-- Connect to app_db
\c app_db;

-- ========== Create Users Table ==========
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== Insert Sample Data ==========
INSERT INTO users (username, email, full_name) VALUES
  ('john_doe', 'john@example.com', 'John Doe'),
  ('jane_smith', 'jane@example.com', 'Jane Smith'),
  ('mike_johnson', 'mike@example.com', 'Mike Johnson'),
  ('sarah_williams', 'sarah@example.com', 'Sarah Williams'),
  ('david_brown', 'david@example.com', 'David Brown');

-- ========== Create Index for Performance ==========
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ========== Verify Data ==========
SELECT COUNT(*) as total_users FROM users;
