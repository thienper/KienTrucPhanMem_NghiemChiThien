# Part 2 - Online Food Delivery (ReactJS + Backend) - Monolith

## 1) Cau truc

- `backend/`: Express API monolith
- `frontend/`: React app (Vite)

## 2) Chuc nang da code

Backend:

- `GET /api/health`
- `GET /api/restaurants`
- `GET /api/restaurants/:id/menu`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`

Frontend:

- Chon nha hang
- Chon mon + so luong
- Dat don
- Xem danh sach don hang

## 3) Chay project

Mo 2 terminal.

Terminal 1 (backend):

```bash
cd part2-mono/backend
npm install
npm run dev
```

Terminal 2 (frontend):

```bash
cd part2-mono/frontend
npm install
npm run dev
```

Sau do truy cap: `http://localhost:5173`

## 4) Minh chung can chup

1. Terminal backend dang chay (`localhost:4000`).
2. Terminal frontend dang chay (`localhost:5173`).
3. Trang web co danh sach nha hang + menu.
4. Dat thanh cong 1 don hang va don xuat hien o danh sach.

Khi chup xong, nhan: **"tiep tuc Phan 3"**.
