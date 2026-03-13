const fs = require('fs/promises');

async function readJsonArray(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('Data source must be a JSON array');
  }

  return parsed;
}

async function writeJsonArray(filePath, data) {
  const next = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, `${next}\n`, 'utf8');
}

module.exports = {
  readJsonArray,
  writeJsonArray,
};
