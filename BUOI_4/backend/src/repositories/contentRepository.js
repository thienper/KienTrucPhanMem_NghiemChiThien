const { readJsonArray, writeJsonArray } = require('../utils/fileStorage');

class ContentRepository {
  constructor(dataFilePath) {
    this.dataFilePath = dataFilePath;
  }

  async findAll() {
    return readJsonArray(this.dataFilePath);
  }

  async findById(id) {
    const all = await this.findAll();
    return all.find((item) => item.id === id) || null;
  }

  async create(item) {
    const all = await this.findAll();
    all.push(item);
    await writeJsonArray(this.dataFilePath, all);
    return item;
  }

  async updateById(id, updates) {
    const all = await this.findAll();
    const index = all.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    const updated = {
      ...all[index],
      ...updates,
      id,
    };

    all[index] = updated;
    await writeJsonArray(this.dataFilePath, all);

    return updated;
  }

  async deleteById(id) {
    const all = await this.findAll();
    const index = all.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    all.splice(index, 1);
    await writeJsonArray(this.dataFilePath, all);

    return true;
  }
}

module.exports = ContentRepository;
