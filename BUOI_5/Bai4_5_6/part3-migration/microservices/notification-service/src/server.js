import express from "express";
import { readJson, writeJson } from "../../_shared/dataStore.js";

const app = express();
const PORT = process.env.PORT || 6106;

app.use(express.json());

const defaultNotifications = {
  notifications: []
};

app.get("/health", (_req, res) => {
  res.json({ service: "notification-service", status: "ok" });
});

app.post("/notify", (req, res) => {
  const store = readJson("notifications.json", defaultNotifications);
  const { notifications } = store;

  const event = {
    id: `n${notifications.length + 1}`,
    orderId: req.body.orderId,
    type: req.body.type,
    message: req.body.message,
    createdAt: new Date().toISOString()
  };
  notifications.push(event);
  writeJson("notifications.json", store);
  res.status(201).json(event);
});

app.get("/notifications", (_req, res) => {
  const { notifications } = readJson("notifications.json", defaultNotifications);
  res.json(notifications);
});

app.listen(PORT, () => {
  console.log(`notification-service running at http://localhost:${PORT}`);
});
