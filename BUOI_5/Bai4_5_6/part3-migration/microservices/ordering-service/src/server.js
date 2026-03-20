import express from "express";
import { readJson, writeJson } from "../../_shared/dataStore.js";

const app = express();
const PORT = process.env.PORT || 6103;

app.use(express.json());

const defaultOrders = {
  orders: [],
  pendingOrderIds: []
};

app.get("/health", (_req, res) => {
  res.json({ service: "ordering-service", status: "ok" });
});

app.get("/orders", (_req, res) => {
  const { orders } = readJson("orders.json", defaultOrders);
  res.json(orders);
});

app.get("/orders/pending", (_req, res) => {
  const { orders, pendingOrderIds } = readJson("orders.json", defaultOrders);
  res.json(orders.filter((order) => pendingOrderIds.includes(order.id)));
});

app.post("/orders", (req, res) => {
  const { customer, restaurantId, restaurantName, items, deliveryFee, mode } = req.body;
  if (!customer || !restaurantId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid order payload" });
  }

  const store = readJson("orders.json", defaultOrders);
  const { orders, pendingOrderIds } = store;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: `o${orders.length + 1}`,
    customer,
    restaurantId,
    restaurantName,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    status: mode === "offline" ? "PENDING_SYNC" : "CONFIRMED",
    createdAt: new Date().toISOString(),
    paymentId: null,
    deliveryTaskId: null
  };

  orders.push(order);
  if (mode === "offline") {
    pendingOrderIds.push(order.id);
  }

  writeJson("orders.json", store);

  return res.status(201).json(order);
});

app.patch("/orders/:id/settle", (req, res) => {
  const store = readJson("orders.json", defaultOrders);
  const { orders, pendingOrderIds } = store;

  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = "CONFIRMED";
  order.paymentId = req.body.paymentId || null;
  order.deliveryTaskId = req.body.deliveryTaskId || null;

  const index = pendingOrderIds.findIndex((id) => id === order.id);
  if (index >= 0) {
    pendingOrderIds.splice(index, 1);
  }

  writeJson("orders.json", store);

  return res.json(order);
});

app.listen(PORT, () => {
  console.log(`ordering-service running at http://localhost:${PORT}`);
});
