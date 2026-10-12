const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');

// POST /api/consultar — Fase 1 (streaming SSE)
module.exports = (controller, middlewares = []) => {
  const router = express.Router();
  router.post('/consultar', ...middlewares, asyncHandler(controller.consultar));
  return router;
};
