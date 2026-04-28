import express from 'express';
// Añadimos googleLogin y googleCallback a la importación
import { login, logout, verificarAuth, googleLogin, googleCallback } from '../controllers/authController.js';
import { validarApiKey, verificarToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', validarApiKey, login);
router.post('/logout', verificarToken, logout);
router.get('/verify', verificarToken, verificarAuth);

// Rutas Google
router.get('/google/login', googleLogin);
router.get('/google/callback', googleCallback);

export default router;