# Frontend - React Application

## Mô tả
Frontend React để tương tác với 3 phiên bản kiến trúc backend.

## Setup

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

Server chạy ở: `http://localhost:3000`

### 3. Build for production
```bash
npm run build
```

## Configuration

### API URLs
Trong file `App.jsx`, bạn có thể chọn API endpoint tùy thuộc vào phiên bản backend:

```javascript
// Part 1 - Monolith (Port 4000)
const API_BASE_URL = 'http://localhost:4000/api'

// Part 2 - 3 Functions (Ports 3001, 3002, 3003)
const USER_API = 'http://localhost:3001/api'
const PRODUCT_API = 'http://localhost:3002/api'
const ORDER_API = 'http://localhost:3003/api'

// Part 3 - Service-Based (Port 5000 - Current)
const API_BASE_URL = 'http://localhost:5000/api'
```

## Features

### 1. Architecture Info Tab
- Hiển thị thông tin về 3 kiến trúc khác nhau
- So sánh các phiên bản
- Status của từng service

### 2. Users Tab
- Xem danh sách người dùng
- Tạo người dùng mới
- Tự động refresh danh sách

### 3. Products Tab
- Xem danh sách sản phẩm
- Thêm sản phẩm mới (với giá và số lượng)
- Cập nhật sản phẩm

### 4. Orders Tab
- Xem danh sách đơn hàng
- Tạo đơn hàng mới
- Chọn user và product từ dropdown
- Tính toán tổng tiền tự động

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── UserTab.jsx
│   │   ├── ProductTab.jsx
│   │   ├── OrderTab.jsx
│   │   └── ArchitectureInfo.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   ├── index.css
│   └── index-additional.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Cách sử dụng

### Testing Part 1 (Monolith)

1. Đổi API URL thành `http://localhost:4000/api` trong App.jsx
2. Chạy monolith backend: `cd part1-monolith && npm start`
3. Chạy frontend: `npm run dev`
4. Truy cập `http://localhost:3000`

### Testing Part 2 (3 Functions)

1. Tạo 3 instance khác nhau của API service
2. Chạy 3 services trên ports 3001, 3002, 3003
3. Sửa App.jsx để gọi đúng services
4. Chạy frontend và test

### Testing Part 3 (Service-Based)

1. Chạy API Gateway trên port 5000
2. API URL đã được cấu hình: `http://localhost:5000/api`
3. Chạy frontend: `npm run dev`
4. Health check sẽ tự động kiểm tra trạng thái gateway

## API Endpoints (Part 3)

```
GET    http://localhost:5000/api/users
POST   http://localhost:5000/api/users
GET    http://localhost:5000/api/products
POST   http://localhost:5000/api/products
GET    http://localhost:5000/api/orders
POST   http://localhost:5000/api/orders
GET    http://localhost:5000/health
```

## Technologies

- **React 18** - UI Framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **CSS3** - Styling

## Troubleshooting

### CORS Issues
Nếu gặp lỗi CORS, đảm bảo backend có:
```javascript
app.use(cors());
```

### API Not Responding
1. Kiểm tra backend có chạy trên đúng port
2. Kiểm tra API URL trong App.jsx
3. Mở browser console (F12) để xem chi tiết lỗi

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## Development Tips

1. **Hot Reload**: Thay đổi code sẽ tự động reload
2. **Console Logs**: Mở DevTools (F12) để debug
3. **Network Tab**: Kiểm tra API calls và responses
4. **Performance**: Dùng React DevTools extension

## Next Steps

1. Thêm authentication (JWT token)
2. Thêm error handling/retry logic
3. Implement pagination cho danh sách
4. Thêm search/filter functionality
5. UI/UX improvements
