import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../../models/index.cjs'; // Importamos la base de datos

const { Persona } = db;

export const generarTokenCSRF = () => crypto.randomBytes(32).toString('hex');

export const login = async (req, res) => { // Ahora es async
  try {
    const { email } = req.body;
    
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    // BUSCAMOS AL USUARIO EN DB
    const usuario = await Persona.findOne({ 
      where: { email: email.trim(), activo: true } 
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado o cuenta inactiva' });
    }
    
    const csrfToken = generarTokenCSRF();
    
    // Usamos los datos reales de MariaDB para el Token
    const payload = {
      id: usuario.id,
      email: usuario.email,
      apiKey: process.env.API_KEY,
      csrfToken: csrfToken
    };
    
    const tokenJWT = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    res.cookie('jwt_token', tokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });
    
    res.cookie('csrf_token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });
    
    res.json({
      mensaje: 'Login exitoso',
      usuario: { id: payload.id, email: payload.email },
      csrfToken: csrfToken 
    });
    
  } catch (error) {
    console.error("ERROR REAL EN EL LOGIN:", error);
    res.status(500).json({ error: 'Error en el proceso de login' });
  }
};

/**
 * Logout - Eliminar cookies
 */
export const logout = (req, res) => {
  try {
    res.clearCookie('jwt_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.clearCookie('csrf_token', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({ mensaje: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error en el proceso de logout' });
  }
};

/**
 * Verificar estado de autenticación
 */
export const verificarAuth = (req, res) => {
  try {
    res.json({
      autenticado: true,
      usuario: req.usuario
    });
  } catch (error) {
    console.error('Error al verificar auth:', error);
    res.status(500).json({ error: 'Error al verificar autenticación' });
  }
};