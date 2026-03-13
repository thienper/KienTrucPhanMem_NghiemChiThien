const { Router } = require('express');

function createContentRoutes(contentController) {
  const router = Router();

  router.get('/', contentController.list);
  router.post('/', contentController.create);
  router.put('/:id', contentController.update);
  router.delete('/:id', contentController.remove);

  return router;
}

module.exports = createContentRoutes;
