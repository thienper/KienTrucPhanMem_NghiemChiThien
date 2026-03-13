const ContentRepository = require('../repositories/contentRepository');
const ContentService = require('../services/contentService');
const ContentController = require('../controllers/contentController');
const createContentRoutes = require('../routes/contentRoutes');

module.exports = {
  name: 'content-management-plugin',
  register({ app, dataFilePath }) {
    const contentRepository = new ContentRepository(dataFilePath);
    const contentService = new ContentService(contentRepository);
    const contentController = new ContentController(contentService);

    app.use('/api/content', createContentRoutes(contentController));
  },
};
