import express from 'express';
import * as tagController from '../controllers/tagController.js'; 

const router = express.Router();

// GET /api/tags - Obtener todos los tags disponibles
router.get('/', tagController.obtenerTodos);

// GET /api/tags/:id/personas - RELACIÓN INDIRECTA
// Obtiene todas las personas que tienen al menos una tarea con este tag específico
router.get('/:id/personas', tagController.obtenerPersonasPorTag);

export default router;