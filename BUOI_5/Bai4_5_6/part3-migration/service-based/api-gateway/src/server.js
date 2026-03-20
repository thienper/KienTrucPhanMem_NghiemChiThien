import cors from "cors";
import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

const CATALOG_URL = process.env.CATALOG_URL || "http://localhost:5101";
const ORDER_URL = process.env.ORDER_URL || "http://localhost:5102";
const DELIVERY_URL = process.env.DELIVERY_URL || "http://localhost:5103";

app.use(cors());
app.use(express.json());

async function forwardJson(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${url}`);
  }

  return response.json();
}

app.get("/api/health", (_req, res) => {
  res.json({ architecture: "service-based", status: "ok" });
});

app.get("/api/restaurants", async (_req, res) => {
  try {
    const data = await forwardJson(`${CATALOG_URL}/restaurants`);
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
});

app.get("/api/restaurants/:id/menu", async (req, res) => {
  try {
    const data = await forwardJson(`${CATALOG_URL}/restaurants/${req.params.id}/menu`);
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
});

app.get("/api/orders", async (_req, res) => {
  try {
    const data = await forwardJson(`${ORDER_URL}/orders`);
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const restaurant = await forwardJson(`${CATALOG_URL}/restaurants/${req.body.restaurantId}/menu`);

    const normalizedItems = (req.body.items || []).map((item) => {
      const menuItem = restaurant.menu.find((m) => m.id === item.menuItemId);
      if (!menuItem || Number(item.quantity || 0) <= 0) {
        throw new Error("Invalid order item");
      }
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: Number(item.quantity)
      };
    });

    const order = await forwardJson(`${ORDER_URL}/orders`, {
      method: "POST",
      body: JSON.stringify({
        customerName: req.body.customerName,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: normalizedItems,
        deliveryFee: restaurant.deliveryFee
      })
    });

    const dispatch = await forwardJson(`${DELIVERY_URL}/dispatch`, {
      method: "POST",
      body: JSON.stringify({ orderId: order.id })
    });

    res.status(201).json({ order, dispatch });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`service-based gateway running at http://localhost:${PORT}`);
});
