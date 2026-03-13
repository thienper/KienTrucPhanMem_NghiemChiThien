# Bai 1 - Node.js Hello Docker

## Build

```bash
docker build -t bai1-nodejs-hello .
```

## Run

```bash
docker run -d --name bai1-node -p 3000:3000 bai1-nodejs-hello
```

Truy cap: http://localhost:3000
