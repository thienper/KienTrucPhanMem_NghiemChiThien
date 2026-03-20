import express from "express";
import { readJson } from "../../_shared/dataStore.js";

const app = express();
const PORT = process.env.PORT || 6101;

const defaultUsers = {
  users: [{ id: "u1", fullName: "Nguyen Van A", tier: "GOLD" }]
};

app.get("/health", (_req, res) => {
  res.json({ service: "identity-service", status: "ok" });
});

app.get("/users/default", (_req, res) => {
  const { users } = readJson("users.json", defaultUsers);
  if (!users.length) {
    return res.status(404).json({ message: "No users found" });
  }
  res.json(users[0]);
});

app.listen(PORT, () => {
  console.log(`identity-service running at http://localhost:${PORT}`);
});
