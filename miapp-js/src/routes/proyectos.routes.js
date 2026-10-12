const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');

// /api/proyectos — módulo "API para BD"
module.exports = (controller) => {
  const router = express.Router();
  router.get('/proyectos', asyncHandler(controller.listar));
  router.get('/proyectos/:id', asyncHandler(controller.obtener));
  router.post('/proyectos', asyncHandler(controller.crear));
  router.put('/proyectos/:id', asyncHandler(controller.actualizar));
  router.delete('/proyectos/:id', asyncHandler(controller.eliminar));
  return router;
};
