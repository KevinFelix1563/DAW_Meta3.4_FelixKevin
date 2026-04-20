import express from 'express';
import * as pc from '../controllers/personaController.js';

const router = express.Router();
router.post('/registro', pc.registro);
router.put('/:id', pc.modificar);
router.patch('/:id/estado', pc.cambiarEstado); // Activación/Desactivación
router.get('/:id/tags', pc.obtenerTagsDePersona); // Relación indirecta
export default router;