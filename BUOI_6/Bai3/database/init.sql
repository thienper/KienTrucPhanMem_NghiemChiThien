-- Create database if not exists
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Insert sample data
INSERT INTO users (username, email, password) VALUES
('john_doe', 'john@example.com', 'hashed_pass_1'),
('jane_smith', 'jane@example.com', 'hashed_pass_2'),
('bob_wilson', 'bob@example.com', 'hashed_pass_3')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock) VALUES
('Laptop Pro', 'High-performance laptop', 1999.99, 10),
('Wireless Mouse', 'USB-C wireless mouse', 49.99, 50),
('Mechanical Keyboard', 'RGB mechanical keyboard', 149.99, 30),
('4K Monitor', '27-inch 4K monitor', 499.99, 15),
('USB-C Hub', '7-in-1 USB-C hub', 79.99, 40)
ON CONFLICT DO NOTHING;

INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES
(1, 1, 1, 1999.99, 'completed'),
(1, 2, 2, 99.98, 'completed'),
(2, 3, 1, 149.99, 'pending'),
(3, 4, 1, 499.99, 'processing')
ON CONFLICT DO NOTHING;
