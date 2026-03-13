class ContentController {
  constructor(contentService) {
    this.contentService = contentService;

    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  async list(_req, res) {
    const items = await this.contentService.list();
    res.json(items);
  }

  async create(req, res) {
    try {
      const created = await this.contentService.create(req.body || {});
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await this.contentService.update(req.params.id, req.body || {});

      if (!updated) {
        return res.status(404).json({ message: 'Item not found' });
      }

      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async remove(req, res) {
    const deleted = await this.contentService.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.status(204).send();
  }
}

module.exports = ContentController;
