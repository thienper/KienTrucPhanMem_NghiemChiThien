# Part 3 - Service-based -> Micro 7 (Online/Offline)

## 1) Muc tieu

- Chuyen tu monolith sang service-based (3 services).
- Tiep tuc tach thanh microservices 7 context.
- Co che mode `online/offline` tai gateway de mo phong van hanh thuc te.

## 2) Cau truc

- `service-based/`
  - `api-gateway` (port 5000)
  - `catalog-service` (port 5101)
  - `order-core-service` (port 5102)
  - `delivery-service` (port 5103)

- `microservices/`
  - `api-gateway` (port 6000)
  - `identity-service` (6101)
  - `restaurant-service` (6102)
  - `ordering-service` (6103)
  - `payment-service` (6104)
  - `delivery-service` (6105)
  - `notification-service` (6106)
  - `analytics-service` (6107)
  - `data/` JSON data files dung chung cho microservices
  - `_shared/dataStore.js` helper doc/ghi JSON

- `frontend/`
  - React UI demo cho mode switch + dat don + sync pending.

## 3) Cac endpoint quan trong (Micro)

Gateway:

- `GET /api/health`
- `GET /api/mode`
- `PATCH /api/mode` with `{ "mode": "online|offline" }`
- `GET /api/restaurants`
- `GET /api/restaurants/:id/menu`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/sync`

## 4) Chay service-based (moc trung gian)

Mo 4 terminal:

```bash
cd part3-migration/service-based/catalog-service && npm install && npm run dev
cd part3-migration/service-based/order-core-service && npm install && npm run dev
cd part3-migration/service-based/delivery-service && npm install && npm run dev
cd part3-migration/service-based/api-gateway && npm install && npm run dev
```

Test nhanh:

- `http://localhost:5000/api/health`

## 5) Chay micro-7 + frontend

Mo 9 terminal backend:

```bash
cd part3-migration/microservices/identity-service && npm install && npm run dev
cd part3-migration/microservices/restaurant-service && npm install && npm run dev
cd part3-migration/microservices/ordering-service && npm install && npm run dev
cd part3-migration/microservices/payment-service && npm install && npm run dev
cd part3-migration/microservices/delivery-service && npm install && npm run dev
cd part3-migration/microservices/notification-service && npm install && npm run dev
cd part3-migration/microservices/analytics-service && npm install && npm run dev
cd part3-migration/microservices/api-gateway && npm install && npm run dev
```

Mo terminal frontend:

```bash
cd part3-migration/frontend && npm install && npm run dev
```

UI demo:

- `http://localhost:5174`

## 6) Kich ban minh chung offline -> online

1. Mo UI, chuyen mode sang `offline`.
2. Dat 1-2 don, status se la `PENDING_SYNC`.
3. Chuyen mode sang `online`.
4. Bam `Sync Pending`.
5. Don duoc doi trang thai `CONFIRMED`.

## 7) Mapping 7 context

1. Identity: user/profile.
2. Restaurant: menu/catalog.
3. Ordering: lifecycle don hang + pending queue.
4. Payment: authorize thanh toan.
5. Delivery: gan shipper.
6. Notification: gui thong bao event.
7. Analytics: ghi nhan event phan tich.

## 8) Quan ly du lieu bang JSON

Ban co the chinh du lieu mau truc tiep trong:

- `microservices/data/users.json`
- `microservices/data/restaurants.json`
- `microservices/data/orders.json`
- `microservices/data/payments.json`
- `microservices/data/deliveryTasks.json`
- `microservices/data/notifications.json`
- `microservices/data/analyticsEvents.json`

Luu y:

- `orders.json`, `payments.json`, `deliveryTasks.json`, `notifications.json`, `analyticsEvents.json` se duoc cap nhat tu dong khi goi API.
- Neu muon reset du lieu, chi can xoa noi dung cac file nay ve mang rong.
