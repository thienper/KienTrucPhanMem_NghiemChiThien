import express from "express";

const app = express();
const PORT = process.env.PORT || 5103;

app.use(express.json());

const tasks = [];

app.get("/health", (_req, res) => {
  res.json({ service: "delivery-service", status: "ok" });
});

app.post("/dispatch", (req, res) => {
  const { orderId } = req.body;
  const task = {
    id: `d${tasks.length + 1}`,
    orderId,
    driver: "shipper-01",
    status: "ASSIGNED"
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.listen(PORT, () => {
  console.log(`delivery-service running at http://localhost:${PORT}`);
});
