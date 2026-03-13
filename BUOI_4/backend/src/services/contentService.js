const { randomUUID } = require('crypto');

class ContentService {
  constructor(contentRepository) {
    this.contentRepository = contentRepository;
  }

  async list() {
    return this.contentRepository.findAll();
  }

  async create(payload) {
    const clean = this.#sanitize(payload);
    this.#validateForCreate(clean);

    const item = {
      id: randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase(),
      ...clean,
    };

    return this.contentRepository.create(item);
  }

  async update(id, payload) {
    const clean = this.#sanitize(payload);
    this.#validateForUpdate(clean);

    return this.contentRepository.updateById(id, clean);
  }

  async remove(id) {
    return this.contentRepository.deleteById(id);
  }

  #sanitize(payload) {
    return {
      name: typeof payload.name === 'string' ? payload.name.trim() : undefined,
      language:
        typeof payload.language === 'string' ? payload.language.trim() : undefined,
      bio: typeof payload.bio === 'string' ? payload.bio.trim() : undefined,
      version:
        payload.version === undefined || payload.version === null
          ? undefined
          : Number(payload.version),
    };
  }

  #validateForCreate(payload) {
    if (!payload.name) {
      throw new Error('Name is required');
    }
    if (!payload.language) {
      throw new Error('Language is required');
    }
    if (!payload.bio) {
      throw new Error('Bio is required');
    }
    if (typeof payload.version !== 'number' || Number.isNaN(payload.version)) {
      throw new Error('Version must be a number');
    }
  }

  #validateForUpdate(payload) {
    if (Object.values(payload).every((value) => value === undefined)) {
      throw new Error('At least one field is required for update');
    }

    if (payload.version !== undefined && Number.isNaN(payload.version)) {
      throw new Error('Version must be a number');
    }
  }
}

module.exports = ContentService;
