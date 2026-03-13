# Phan 1 - Cac lenh Docker co ban

## 1) Kiem tra phien ban Docker

```bash
docker --version
```

## 2) Chay container mau hello-world

```bash
docker run hello-world
```

## 3) Tai image nginx

```bash
docker pull nginx
```

## 4) Liet ke image

```bash
docker images
```

## 5) Chay nginx nen

```bash
docker run -d nginx
```

## 6) Xem container dang chay

```bash
docker ps
```

## 7) Xem tat ca container

```bash
docker ps -a
```

## 8) Xem log container

```bash
docker logs <container_id>
```

## 9) Vao shell container

```bash
docker exec -it <container_id> /bin/sh
```

## 10) Dung container

```bash
docker stop <container_id>
```

## 11) Khoi dong lai container

```bash
docker restart <container_id>
```

## 12) Xoa container

```bash
docker rm <container_id>
```

## 13) Xoa container da dung

```bash
docker container prune
```

## 14) Xoa image theo ID

```bash
docker rmi <image_id>
```

## 15) Xoa image khong dung

```bash
docker image prune -a
```

## 16) Chay nginx map cong

```bash
docker run -d -p 8080:80 nginx
```

## 17) Xem thong tin chi tiet container

```bash
docker inspect <container_id>
```

## 18) Chay nginx voi volume

```bash
docker run -d -v mydata:/data nginx
```

## 19) Liet ke volume

```bash
docker volume ls
```

## 20) Xoa volume khong dung

```bash
docker volume prune
```

## 21) Chay nginx va dat ten

```bash
docker run -d --name my_nginx nginx
```

## 22) Theo doi tai nguyen

```bash
docker stats
```

## 23) Liet ke network

```bash
docker network ls
```

## 24) Tao network moi

```bash
docker network create my_network
```

## 25) Chay container trong network moi

```bash
docker run -d --network my_network --name my_container nginx
```

## 26) Gan them container vao network

```bash
docker network connect my_network my_nginx
```

## 27) Truyen bien moi truong

```bash
docker run -d -e MY_ENV=hello_world nginx
```

## 28) Xem log realtime

```bash
docker logs -f my_nginx
```

## 29) Dockerfile nginx don gian

Noi dung file Dockerfile:

```dockerfile
FROM nginx
COPY index.html /usr/share/nginx/html/index.html
```

## 30) Build image tu Dockerfile

```bash
docker build -t my_nginx_image .
```

## 31) Chay image vua build

```bash
docker run -d -p 8080:80 my_nginx_image
```

Ghi chu:

- Thay `<container_id>` va `<image_id>` bang ID thuc te.
- Co the dung ten container thay cho ID o nhieu lenh.
