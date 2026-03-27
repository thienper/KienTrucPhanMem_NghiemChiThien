# Database Documentation

## PostgreSQL Setup

### Database Schema

```sql
-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

## Connection Details

### Monolith & Functions
- **Host**: localhost
- **Port**: 5432
- **Database**: app_db
- **User**: postgres
- **Password**: postgres123

### Connection String
```
postgresql://postgres:postgres123@localhost:5432/app_db
```

## Sample Data

```sql
-- Insert sample users
INSERT INTO users (username, email, password) VALUES
('john', 'john@example.com', 'hashed_password_1'),
('jane', 'jane@example.com', 'hashed_password_2'),
('bob', 'bob@example.com', 'hashed_password_3');

-- Insert sample products
INSERT INTO products (name, description, price, stock) VALUES
('Laptop', 'High-performance laptop', 999.99, 10),
('Mouse', 'Wireless mouse', 29.99, 50),
('Keyboard', 'Mechanical keyboard', 79.99, 30),
('Monitor', '27-inch 4K monitor', 399.99, 15);

-- Insert sample orders
INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES
(1, 1, 1, 999.99, 'completed'),
(1, 2, 2, 59.98, 'completed'),
(2, 3, 1, 79.99, 'pending'),
(3, 4, 2, 799.98, 'processing');
```

## Database Migrations

Tất cả 3 phases (Monolith, Functions, Service-Based) dùng **cùng** database schema.

**Lý do:**
- Dễ so sánh giữa các architecture
- Cùng data source, chỉ khác cách tổ chức code
- Giúp hiểu rõ sự khác biệt giữa các cách design

## Tools for Database Management

### Docker Exec
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d app_db

# Run SQL file
docker-compose exec postgres psql -U postgres -d app_db < init.sql
```

### DBeaver / TablePlus
- Kết nối đến localhost:5432
- Database: app_db
- User: postgres
- Password: postgres123
