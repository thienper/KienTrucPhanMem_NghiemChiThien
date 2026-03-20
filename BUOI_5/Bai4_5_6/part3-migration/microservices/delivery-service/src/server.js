import express from "express";
import { readJson, writeJson } from "../../_shared/dataStore.js";

const app = express();
const PORT = process.env.PORT || 6105;

app.use(express.json());

const defaultTasks = {
  tasks: []
};

app.get("/health", (_req, res) => {
  res.json({ service: "delivery-service", status: "ok" });
});

app.post("/assign", (req, res) => {
  const store = readJson("deliveryTasks.json", defaultTasks);
  const { tasks } = store;

  const task = {
    id: `d${tasks.length + 1}`,
    orderId: req.body.orderId,
    driver: "shipper-01",
    status: "ASSIGNED"
  };
  tasks.push(task);
  writeJson("deliveryTasks.json", store);
  res.status(201).json(task);
});

app.listen(PORT, () => {
  console.log(`delivery-service running at http://localhost:${PORT}`);
});
