import express from 'express';
import * as tareaController from '../controllers/tarea.controller.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas de tareas requieren estar autenticado 
router.use(verificarToken); 

router.get('/', tareaController.obtenerTodas);
router.post('/', tareaController.crear);
router.put('/:id', tareaController.actualizar);
router.delete('/:id', tareaController.eliminar);

router.post('/:id/tags', tareaController.agregarTag);
// Reemplazamos la ruta get por un post para poder enviar el array de tags en el body
router.post('/buscar', tareaController.buscarMisTareasPorEtiquetas);

export default router;