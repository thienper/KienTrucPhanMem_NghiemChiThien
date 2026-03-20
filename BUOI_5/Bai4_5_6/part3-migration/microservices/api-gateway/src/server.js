import cors from "cors";
import express from "express";

const app = express();
const PORT = process.env.PORT || 6000;

const IDENTITY_URL = process.env.IDENTITY_URL || "http://localhost:6101";
const RESTAURANT_URL = process.env.RESTAURANT_URL || "http://localhost:6102";
const ORDERING_URL = process.env.ORDERING_URL || "http://localhost:6103";
const PAYMENT_URL = process.env.PAYMENT_URL || "http://localhost:6104";
const DELIVERY_URL = process.env.DELIVERY_URL || "http://localhost:6105";
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || "http://localhost:6106";
const ANALYTICS_URL = process.env.ANALYTICS_URL || "http://localhost:6107";

let systemMode = "online";

app.use(cors());
app.use(express.json());

async function callJson(url, options) {
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

async function emitAnalytics(type, payload) {
  try {
    await callJson(`${ANALYTICS_URL}/events`, {
      method: "POST",
      body: JSON.stringify({ type, payload })
    });
  } catch {
    // Ignore analytics failure to avoid blocking core flow.
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ architecture: "microservices", status: "ok", mode: systemMode });
});

app.get("/api/mode", (_req, res) => {
  res.json({ mode: systemMode });
});

app.patch("/api/mode", (req, res) => {
  const mode = req.body.mode;
  if (mode !== "online" && mode !== "offline") {
    return res.status(400).json({ message: "Mode must be online or offline" });
  }
  systemMode = mode;
  return res.json({ mode: systemMode });
});

app.get("/api/restaurants", async (_req, res) => {
  try {
    const data = await callJson(`${RESTAURANT_URL}/restaurants`);
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
});

app.get("/api/restaurants/:id/menu", async (req, res) => {
  try {
    const data = await callJson(`${RESTAURANT_URL}/restaurants/${req.params.id}/menu`);
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
});

app.get("/api/orders", async (_req, res) => {
  try {
    const data = await callJson(`${ORDERING_URL}/orders`);
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const customer = await callJson(`${IDENTITY_URL}/users/default`);
    const restaurant = await callJson(`${RESTAURANT_URL}/restaurants/${req.body.restaurantId}/menu`);

    const items = (req.body.items || []).map((item) => {
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

    const order = await callJson(`${ORDERING_URL}/orders`, {
      method: "POST",
      body: JSON.stringify({
        customer,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items,
        deliveryFee: restaurant.deliveryFee,
        mode: systemMode
      })
    });

    if (systemMode === "offline") {
      await callJson(`${NOTIFICATION_URL}/notify`, {
        method: "POST",
        body: JSON.stringify({
          orderId: order.id,
          type: "ORDER_QUEUED",
          message: "Order is queued and will sync when system is online"
        })
      });
      await emitAnalytics("OrderQueued", { orderId: order.id });
      return res.status(201).json({ mode: systemMode, order });
    }

    const payment = await callJson(`${PAYMENT_URL}/authorize`, {
      method: "POST",
      body: JSON.stringify({ orderId: order.id, amount: order.total })
    });

    const delivery = await callJson(`${DELIVERY_URL}/assign`, {
      method: "POST",
      body: JSON.stringify({ orderId: order.id })
    });

    const settledOrder = await callJson(`${ORDERING_URL}/orders/${order.id}/settle`, {
      method: "PATCH",
      body: JSON.stringify({ paymentId: payment.id, deliveryTaskId: delivery.id })
    });

    await callJson(`${NOTIFICATION_URL}/notify`, {
      method: "POST",
      body: JSON.stringify({
        orderId: settledOrder.id,
        type: "ORDER_CONFIRMED",
        message: "Order confirmed and assigned to driver"
      })
    });

    await emitAnalytics("OrderConfirmed", { orderId: settledOrder.id });

    return res.status(201).json({ mode: systemMode, order: settledOrder, payment, delivery });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post("/api/sync", async (_req, res) => {
  if (systemMode !== "online") {
    return res.status(400).json({ message: "Switch to online mode before syncing" });
  }

  try {
    const pendingOrders = await callJson(`${ORDERING_URL}/orders/pending`);
    const synced = [];

    for (const order of pendingOrders) {
      const payment = await callJson(`${PAYMENT_URL}/authorize`, {
        method: "POST",
        body: JSON.stringify({ orderId: order.id, amount: order.total })
      });

      const delivery = await callJson(`${DELIVERY_URL}/assign`, {
        method: "POST",
        body: JSON.stringify({ orderId: order.id })
      });

      const settledOrder = await callJson(`${ORDERING_URL}/orders/${order.id}/settle`, {
        method: "PATCH",
        body: JSON.stringify({ paymentId: payment.id, deliveryTaskId: delivery.id })
      });

      await callJson(`${NOTIFICATION_URL}/notify`, {
        method: "POST",
        body: JSON.stringify({
          orderId: settledOrder.id,
          type: "ORDER_SYNCED",
          message: "Pending order synced successfully"
        })
      });

      await emitAnalytics("OrderSynced", { orderId: settledOrder.id });
      synced.push(settledOrder.id);
    }

    return res.json({ syncedCount: synced.length, orderIds: synced });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`micro gateway running at http://localhost:${PORT}`);
});
