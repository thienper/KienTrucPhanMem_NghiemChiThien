# Bai 4 - Nginx Static

## Build

```bash
docker build -t bai4-nginx-static .
```

## Run

```bash
docker run -d --name bai4-nginx -p 8080:80 bai4-nginx-static
```

Truy cap: http://localhost:8080
