import express from "express";

const app = express();
const PORT = process.env.PORT || 5101;

const restaurants = [
  {
    id: "r1",
    name: "Bun Bo Hue Co Lan",
    deliveryFee: 15000,
    menu: [
      { id: "m1", name: "Bun Bo Dac Biet", price: 55000 },
      { id: "m2", name: "Cha Gio", price: 30000 }
    ]
  },
  {
    id: "r2",
    name: "Com Tam Sai Gon 1988",
    deliveryFee: 12000,
    menu: [
      { id: "m3", name: "Com Tam Suon Bi Cha", price: 50000 },
      { id: "m4", name: "Com Ga Nuong", price: 48000 }
    ]
  }
];

app.get("/health", (_req, res) => {
  res.json({ service: "catalog-service", status: "ok" });
});

app.get("/restaurants", (_req, res) => {
  res.json(restaurants.map((r) => ({ id: r.id, name: r.name, deliveryFee: r.deliveryFee })));
});

app.get("/restaurants/:id/menu", (req, res) => {
  const restaurant = restaurants.find((r) => r.id === req.params.id);
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  return res.json(restaurant);
});

app.listen(PORT, () => {
  console.log(`catalog-service running at http://localhost:${PORT}`);
});
