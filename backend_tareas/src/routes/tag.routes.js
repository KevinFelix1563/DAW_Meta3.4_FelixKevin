import express from 'express';
import * as tagController from '../controllers/tagController.js'; 
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas de tags requieren estar autenticado
router.use(verificarToken);

router.get('/', tagController.obtenerTodos);
router.post('/', tagController.crear);
router.put('/:id', tagController.actualizar);
router.delete('/:id', tagController.eliminar);

export default router;