# Bai 10 - PHP Apache

## Build

```bash
docker build -t bai10-php-apache .
```

## Run voi mount source (yeu cau bai)

### macOS/Linux

```bash
docker run -d --name bai10-php -p 8080:80 -v "$(pwd)":/var/www/html bai10-php-apache
```

### Windows CMD

```bat
docker run -d --name bai10-php -p 8080:80 -v "%cd%":/var/www/html bai10-php-apache
```

Truy cap: http://localhost:8080
