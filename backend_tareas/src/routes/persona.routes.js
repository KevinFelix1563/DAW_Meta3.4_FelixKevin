import express from 'express';
import * as pc from '../controllers/personaController.js';
import { verificarToken, esAdmin } from '../middleware/auth.js'; // Importamos seguridad

const router = express.Router();

// Debe estar logueado y debe ser Admin
router.get('/', verificarToken, esAdmin, pc.obtenerTodas);
router.post('/registro', verificarToken, esAdmin, pc.registro);
router.put('/:id', verificarToken, esAdmin, pc.modificar);
router.patch('/:id/estado', verificarToken, esAdmin, pc.cambiarEstado); 

// Esta consulta la puede hacer cualquiera, la dejamos solo con verificarToken
router.get('/:id/tags', verificarToken, pc.obtenerTagsDePersona); 

export default router;