import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { verificarToken, esAdmin } from '../middleware/auth.js';

const router = express.Router();

// Solo usuarios logueados que sean "admin"
router.use(verificarToken, esAdmin);

router.post('/busqueda/tareas', adminController.buscarTareasPorEtiquetas);
router.post('/busqueda/usuarios', adminController.buscarUsuariosPorEtiquetas);
router.post('/busqueda/etiquetas', adminController.buscarEtiquetasPorUsuarios);

export default router;