const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');

// GET /api/nodos — árbol de nodos del wizard
module.exports = (controller) => {
  const router = express.Router();
  router.get('/nodos', asyncHandler(controller.nodos));
  return router;
};
