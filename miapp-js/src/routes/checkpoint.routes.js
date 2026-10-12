const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');

// /api/checkpoint — módulo "Lectura y Escritura"
module.exports = (controller) => {
  const router = express.Router();
  router.post('/checkpoint', asyncHandler(controller.crear));
  router.get('/checkpoint', asyncHandler(controller.listar));
  router.get('/checkpoint/:id', asyncHandler(controller.obtener));
  router.delete('/checkpoint/:id', asyncHandler(controller.eliminar));
  return router;
};
