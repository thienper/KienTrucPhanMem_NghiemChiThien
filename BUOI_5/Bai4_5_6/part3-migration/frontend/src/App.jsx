import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:6000/api";

async function api(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }

  return response.json();
}

export default function App() {
  const [mode, setMode] = useState("online");
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMode();
    loadRestaurants();
    loadOrders();
  }, []);

  async function loadMode() {
    const data = await api("/mode");
    setMode(data.mode);
  }

  async function loadRestaurants() {
    const data = await api("/restaurants");
    setRestaurants(data);
    if (data.length > 0) {
      setRestaurantId(data[0].id);
    }
  }

  async function loadOrders() {
    const data = await api("/orders");
    setOrders(data);
  }

  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    api(`/restaurants/${restaurantId}/menu`).then((data) => {
      setRestaurant(data);
      setCart({});
    });
  }, [restaurantId]);

  const total = useMemo(() => {
    if (!restaurant) {
      return 0;
    }
    const subtotal = restaurant.menu.reduce((sum, menuItem) => {
      return sum + menuItem.price * (cart[menuItem.id] || 0);
    }, 0);
    return subtotal + restaurant.deliveryFee;
  }, [cart, restaurant]);

  function inc(menuItemId, delta) {
    setCart((prev) => {
      const qty = Math.max(0, (prev[menuItemId] || 0) + delta);
      const next = { ...prev, [menuItemId]: qty };
      if (qty === 0) {
        delete next[menuItemId];
      }
      return next;
    });
  }

  async function placeOrder() {
    const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
    if (items.length === 0) {
      setMessage("Chon it nhat 1 mon truoc khi dat");
      return;
    }

    await api("/orders", {
      method: "POST",
      body: JSON.stringify({ restaurantId, items })
    });

    setMessage(mode === "offline" ? "Don da duoc queue offline" : "Don da duoc xu ly online");
    await loadOrders();
    setCart({});
  }

  async function switchMode(nextMode) {
    await api("/mode", {
      method: "PATCH",
      body: JSON.stringify({ mode: nextMode })
    });
    setMode(nextMode);
    setMessage(`Da chuyen mode sang ${nextMode}`);
  }

  async function syncPendingOrders() {
    const data = await api("/sync", { method: "POST" });
    setMessage(`Sync thanh cong ${data.syncedCount} don`);
    await loadOrders();
  }

  return (
    <div className="page">
      <h1>Part 3 - Service-based to Micro 7</h1>
      <p>Gateway mode: <strong>{mode}</strong></p>

      <div className="row">
        <button onClick={() => switchMode("online")}>Online</button>
        <button onClick={() => switchMode("offline")}>Offline</button>
        <button onClick={syncPendingOrders}>Sync Pending</button>
      </div>

      {message && <p className="msg">{message}</p>}

      <section className="card">
        <h2>Chon nha hang</h2>
        <select value={restaurantId} onChange={(event) => setRestaurantId(event.target.value)}>
          {restaurants.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </section>

      <section className="card">
        <h2>Menu</h2>
        {restaurant?.menu?.map((item) => (
          <div className="menu-item" key={item.id}>
            <span>{item.name} - {item.price.toLocaleString("vi-VN")}d</span>
            <span>
              <button onClick={() => inc(item.id, -1)}>-</button>
              <strong>{cart[item.id] || 0}</strong>
              <button onClick={() => inc(item.id, 1)}>+</button>
            </span>
          </div>
        ))}
        <p><strong>Tong tam tinh: {total.toLocaleString("vi-VN")}d</strong></p>
        <button onClick={placeOrder}>Dat don</button>
      </section>

      <section className="card">
        <h2>Don hang</h2>
        {orders.map((order) => (
          <div className="order" key={order.id}>
            <p>{order.id} - {order.restaurantName}</p>
            <p>Status: {order.status}</p>
            <p>Total: {order.total.toLocaleString("vi-VN")}d</p>
          </div>
        ))}
        {orders.length === 0 && <p>Chua co don</p>}
      </section>
    </div>
  );
}
