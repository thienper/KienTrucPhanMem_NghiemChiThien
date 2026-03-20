import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:4000/api";

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
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState("Nguyen Van A");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRestaurants();
    loadOrders();
  }, []);

  async function loadRestaurants() {
    try {
      const data = await api("/restaurants");
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurantId(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadOrders() {
    try {
      const data = await api("/orders");
      setOrders(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (!selectedRestaurantId) {
      setSelectedRestaurant(null);
      setCart({});
      return;
    }

    async function loadMenu() {
      try {
        const data = await api(`/restaurants/${selectedRestaurantId}/menu`);
        setSelectedRestaurant(data);
        setCart({});
      } catch (err) {
        setError(err.message);
      }
    }

    loadMenu();
  }, [selectedRestaurantId]);

  const subtotal = useMemo(() => {
    if (!selectedRestaurant) {
      return 0;
    }

    return selectedRestaurant.menu.reduce((sum, menuItem) => {
      const quantity = cart[menuItem.id] || 0;
      return sum + menuItem.price * quantity;
    }, 0);
  }, [cart, selectedRestaurant]);

  const total = subtotal + (selectedRestaurant?.deliveryFee || 0);

  function changeQty(menuItemId, delta) {
    setCart((prev) => {
      const nextQty = Math.max(0, (prev[menuItemId] || 0) + delta);
      const next = { ...prev, [menuItemId]: nextQty };
      if (nextQty === 0) {
        delete next[menuItemId];
      }
      return next;
    });
  }

  async function placeOrder() {
    if (!selectedRestaurant) {
      return;
    }

    const items = Object.entries(cart).map(([menuItemId, quantity]) => ({
      menuItemId,
      quantity
    }));

    if (items.length === 0) {
      setError("Ban can chon it nhat 1 mon");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          restaurantId: selectedRestaurant.id,
          items
        })
      });

      setCart({});
      await loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>Online Food Delivery - Monolith</h1>
        <p>Phan 2: ReactJS + Backend (Mono)</p>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>1) Chon nha hang</h2>
        <select value={selectedRestaurantId} onChange={(event) => setSelectedRestaurantId(event.target.value)}>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name} - Phi ship {restaurant.deliveryFee.toLocaleString("vi-VN")}d
            </option>
          ))}
        </select>
      </section>

      <section className="card">
        <h2>2) Chon mon</h2>
        {selectedRestaurant?.menu?.map((menuItem) => (
          <div className="row" key={menuItem.id}>
            <div>
              <strong>{menuItem.name}</strong>
              <p>{menuItem.price.toLocaleString("vi-VN")}d</p>
            </div>
            <div className="qty">
              <button onClick={() => changeQty(menuItem.id, -1)}>-</button>
              <span>{cart[menuItem.id] || 0}</span>
              <button onClick={() => changeQty(menuItem.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>3) Dat don</h2>
        <label>
          Ten khach hang
          <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
        </label>
        <p>Tam tinh: {subtotal.toLocaleString("vi-VN")}d</p>
        <p>Phi ship: {(selectedRestaurant?.deliveryFee || 0).toLocaleString("vi-VN")}d</p>
        <p>
          <strong>Tong: {total.toLocaleString("vi-VN")}d</strong>
        </p>
        <button disabled={loading} onClick={placeOrder}>
          {loading ? "Dang gui..." : "Xac nhan dat don"}
        </button>
      </section>

      <section className="card">
        <h2>Danh sach don hang</h2>
        {orders.length === 0 && <p>Chua co don nao</p>}
        {orders.map((order) => (
          <div key={order.id} className="order">
            <p>
              <strong>{order.id}</strong> - {order.customerName} - {order.restaurantName}
            </p>
            <p>
              Trang thai: <span className="badge">{order.status}</span>
            </p>
            <p>Tong tien: {order.total.toLocaleString("vi-VN")}d</p>
          </div>
        ))}
      </section>
    </div>
  );
}
