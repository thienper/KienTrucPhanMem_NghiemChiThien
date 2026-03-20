import express from "express";

const app = express();
const PORT = process.env.PORT || 5102;

app.use(express.json());

const orders = [];

app.get("/health", (_req, res) => {
  res.json({ service: "order-core-service", status: "ok" });
});

app.get("/orders", (_req, res) => {
  res.json(orders);
});

app.post("/orders", (req, res) => {
  const { customerName, restaurantId, restaurantName, items, deliveryFee } = req.body;

  if (!customerName || !restaurantId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid order payload" });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: `o${orders.length + 1}`,
    customerName,
    restaurantId,
    restaurantName,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    status: "PLACED",
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  return res.status(201).json(order);
});

app.listen(PORT, () => {
  console.log(`order-core-service running at http://localhost:${PORT}`);
});
