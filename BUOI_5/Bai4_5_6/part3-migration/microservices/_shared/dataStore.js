import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "..", "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(fileName) {
  return path.join(DATA_DIR, fileName);
}

export function readJson(fileName, defaultValue) {
  ensureDataDir();
  const fullPath = filePath(fileName);

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify(defaultValue, null, 2), "utf8");
    return structuredClone(defaultValue);
  }

  const content = fs.readFileSync(fullPath, "utf8");
  if (!content.trim()) {
    return structuredClone(defaultValue);
  }

  return JSON.parse(content);
}

export function writeJson(fileName, value) {
  ensureDataDir();
  const fullPath = filePath(fileName);
  fs.writeFileSync(fullPath, JSON.stringify(value, null, 2), "utf8");
}
