# Bai 8 - PostgreSQL Custom

## Build

```bash
docker build -t bai8-postgres .
```

## Run

```bash
docker run -d \
  --name bai8-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=school \
  -p 5432:5432 \
  bai8-postgres
```

File `init.sql` se duoc chay tu dong lan dau khoi tao data.
