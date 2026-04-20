import express from 'express';
import * as tareaController from '../controllers/tarea.controller.js';

const router = express.Router();

// Rutas CRUD básicas
router.get('/', tareaController.obtenerTodas);
router.post('/', tareaController.crear);
router.put('/:id', tareaController.actualizar);
router.delete('/:id', tareaController.eliminar);

// Rutas de relaciones
router.post('/:id/tags', tareaController.agregarTag);
router.get('/tag/:tagId', tareaController.tareasPorTag);

export default router;