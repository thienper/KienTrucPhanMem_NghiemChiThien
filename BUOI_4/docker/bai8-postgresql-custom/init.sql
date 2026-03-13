CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL
);

INSERT INTO students (name, email)
VALUES ('Nguyen Van A', 'a@example.com');
