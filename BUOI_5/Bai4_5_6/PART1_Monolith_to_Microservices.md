# Phan 1 - Bai 4: Monolith -> Microservices migration

## 1) Bai toan

He thong **Online Food Delivery** ban dau la monolith, can migration theo huong service-based va sau cung la microservices.

## 2) Bounded Context de xuat

1. Identity & Access

- Quan ly user, role, auth, profile co ban.

2. Customer Ordering

- Gio hang, dat mon, ap voucher, checkout logic.

3. Restaurant Management

- Quan ly nha hang, menu, gia, trang thai mon.

4. Payment

- Khoi tao giao dich, xac nhan thanh toan, doi soat.

5. Delivery & Dispatch

- Gan shipper, theo doi trang thai giao hang.

6. Notification

- Gui email/SMS/push theo su kien.

7. Analytics & Reporting

- Tong hop bao cao KPI, dashboard van hanh.

## 3) Monolith -> Service-based -> Microservices (lo trinh)

### Giai doan A: Monolith

- Mot codebase, mot DB chinh.
- Module hoa theo bounded context de chuan bi tach.

### Giai doan B: Service-based (3 services)

- Tach thanh 3 cum lon:
  - Core Ordering Service
  - Restaurant Service
  - Delivery Service
- Van co the dung DB chung co phan vung schema.

### Giai doan C: Microservices (7 services)

- Tach hoan toan thanh 7 service nho theo bounded context.
- Moi service co DB rieng (database per service).
- Dong bo du lieu qua event bus.

## 4) Sync vs Async communication

### Sync (HTTP/gRPC)

DUNG KHI:

- Can phan hoi ngay cho user (VD: lay menu, tinh phi ship, check voucher).
- Query read-intensive theo request UI.

RUI RO:

- Tang do phu thuoc runtime.
- Neu chuoi call dai de timeout va fail cascade.

### Async (Kafka/RabbitMQ)

DUNG KHI:

- Chuyen trang thai don hang.
- Gui thong bao.
- Dong bo bao cao, analytics.
- Tich hop dich vu ben thu ba.

LOI ICH:

- Giam coupling.
- Retry/dead-letter de tang reliability.
- Scale doc lap theo consumer group.

## 5) Event messaging design (mo hinh)

### Broker

- Lua chon 1: Kafka (throughput cao, stream/event log).
- Lua chon 2: RabbitMQ (routing linh hoat, queue theo worker).

### Event de xuat

- `OrderPlaced`
- `PaymentAuthorized`
- `PaymentFailed`
- `OrderConfirmed`
- `OrderCancelled`
- `DeliveryAssigned`
- `DeliveryPickedUp`
- `DeliveryCompleted`
- `NotificationRequested`

### Topic/Queue goi y

- `order.events`
- `payment.events`
- `delivery.events`
- `notification.events`
- `analytics.events`

### Reliability patterns

- Outbox Pattern tai service phat sinh event.
- Idempotent Consumer tai service nhan event.
- Retry + Dead Letter Queue.
- Correlation ID de trace xuyen service.

## 6) Deliverable checklist

- [x] Service map
- [x] Context map
- [x] Communication diagram (Sync vs Async)

Chi tiet xem trong thu muc `diagrams/`.
