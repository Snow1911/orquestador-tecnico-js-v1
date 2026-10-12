const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');

// POST /api/fase2 — Fase 2 (streaming SSE)
module.exports = (controller, middlewares = []) => {
  const router = express.Router();
  router.post('/fase2', ...middlewares, asyncHandler(controller.fase2));
  return router;
};
