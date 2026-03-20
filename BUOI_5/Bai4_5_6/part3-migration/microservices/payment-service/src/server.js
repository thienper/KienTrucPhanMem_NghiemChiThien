import express from "express";
import { readJson, writeJson } from "../../_shared/dataStore.js";

const app = express();
const PORT = process.env.PORT || 6104;

app.use(express.json());

const defaultPayments = {
  payments: []
};

app.get("/health", (_req, res) => {
  res.json({ service: "payment-service", status: "ok" });
});

app.post("/authorize", (req, res) => {
  const store = readJson("payments.json", defaultPayments);
  const { payments } = store;

  const payment = {
    id: `p${payments.length + 1}`,
    orderId: req.body.orderId,
    amount: req.body.amount,
    state: "AUTHORIZED",
    createdAt: new Date().toISOString()
  };

  payments.push(payment);
  writeJson("payments.json", store);
  res.status(201).json(payment);
});

app.listen(PORT, () => {
  console.log(`payment-service running at http://localhost:${PORT}`);
});
