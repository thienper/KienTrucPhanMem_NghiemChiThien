# ========== PostgreSQL with Data Persistence ==========
FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_PASSWORD=postgres123
ENV POSTGRES_DB=app_db

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

# Volume sẽ được khai báo trong docker-compose.yml
# Điều này đảm bảo dữ liệu được lưu trữ ngay cả sau khi container bị xóa

EXPOSE 5432
