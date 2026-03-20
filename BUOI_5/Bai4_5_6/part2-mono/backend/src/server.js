import cors from "cors";
import express from "express";
import { db, findMenuItem, findRestaurantById } from "./store.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    architecture: "monolith",
    service: "online-food-delivery-backend"
  });
});

app.get("/api/restaurants", (_req, res) => {
  const summaries = db.restaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    deliveryFee: restaurant.deliveryFee,
    menuCount: restaurant.menu.length
  }));

  res.json(summaries);
});

app.get("/api/restaurants/:id/menu", (req, res) => {
  const restaurant = findRestaurantById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  return res.json({
    id: restaurant.id,
    name: restaurant.name,
    deliveryFee: restaurant.deliveryFee,
    menu: restaurant.menu
  });
});

app.get("/api/orders", (_req, res) => {
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const { customerName, restaurantId, items } = req.body;

  if (!customerName || !restaurantId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "customerName, restaurantId and items are required"
    });
  }

  const restaurant = findRestaurantById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  let subtotal = 0;
  const normalizedItems = [];

  for (const item of items) {
    const menuItem = findMenuItem(restaurant, item.menuItemId);
    const quantity = Number(item.quantity || 0);

    if (!menuItem || quantity <= 0) {
      return res.status(400).json({ message: "Invalid order item" });
    }

    const lineTotal = menuItem.price * quantity;
    subtotal += lineTotal;

    normalizedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      lineTotal
    });
  }

  const order = {
    id: `o${db.orders.length + 1}`,
    customerName,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    status: "PLACED",
    items: normalizedItems,
    subtotal,
    deliveryFee: restaurant.deliveryFee,
    total: subtotal + restaurant.deliveryFee,
    createdAt: new Date().toISOString()
  };

  db.orders.push(order);
  return res.status(201).json(order);
});

app.patch("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["PLACED", "CONFIRMED", "COOKING", "DELIVERING", "COMPLETED", "CANCELLED"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = db.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  return res.json(order);
});

app.listen(PORT, () => {
  console.log(`Monolith backend is running at http://localhost:${PORT}`);
});
