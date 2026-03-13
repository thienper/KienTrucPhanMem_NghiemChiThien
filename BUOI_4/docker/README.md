# Tong hop bai tap Docker

## Cau truc

- phan1-lenh-co-ban
- bai1-nodejs-hello
- bai2-python-flask
- bai3-react
- bai4-nginx-static
- bai5-go-app
- bai6-nodejs-multistage
- bai7-python-env
- bai8-postgresql-custom
- bai9-redis-custom
- bai10-php-apache

## Cach dung nhanh

1. Di chuyen vao bai can chay.
2. Build image theo README trong bai.
3. Run container theo README trong bai.

Vi du (Bai 1):

```bash
cd bai1-nodejs-hello
docker build -t bai1-nodejs-hello .
docker run -d --name bai1-node -p 3000:3000 bai1-nodejs-hello
```
