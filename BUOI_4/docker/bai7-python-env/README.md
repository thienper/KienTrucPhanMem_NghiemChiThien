# Bai 7 - Python ENV

## Build

```bash
docker build -t bai7-python-env .
```

## Run (macOS/Linux)

```bash
docker run --rm bai7-python-env
docker run --rm -e APP_ENV=production bai7-python-env
```

## Run (Windows CMD)

```bat
docker run --rm bai7-python-env
docker run --rm -e APP_ENV=production bai7-python-env
```
