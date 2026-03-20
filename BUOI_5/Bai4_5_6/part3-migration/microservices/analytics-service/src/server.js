import express from "express";
import { readJson, writeJson } from "../../_shared/dataStore.js";

const app = express();
const PORT = process.env.PORT || 6107;

app.use(express.json());

const defaultEvents = {
  events: []
};

app.get("/health", (_req, res) => {
  res.json({ service: "analytics-service", status: "ok" });
});

app.post("/events", (req, res) => {
  const store = readJson("analyticsEvents.json", defaultEvents);
  const { events } = store;

  const event = {
    id: `a${events.length + 1}`,
    type: req.body.type,
    payload: req.body.payload,
    createdAt: new Date().toISOString()
  };
  events.push(event);
  writeJson("analyticsEvents.json", store);
  res.status(201).json(event);
});

app.get("/events", (_req, res) => {
  const { events } = readJson("analyticsEvents.json", defaultEvents);
  res.json(events);
});

app.listen(PORT, () => {
  console.log(`analytics-service running at http://localhost:${PORT}`);
});
