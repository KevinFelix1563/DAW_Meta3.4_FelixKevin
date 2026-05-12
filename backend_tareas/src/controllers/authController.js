import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Importamos bcryptjs para leer las contraseñas
import { google } from 'googleapis';
import db from '../../models/index.cjs';

// Extraemos el modelo Persona de la base de datos
const { Persona } = db;

// Generador de CSRF
export const generarTokenCSRF = () => crypto.randomBytes(32).toString('hex');

// Configuración del cliente OAuth2 de Google
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://localhost:3000/api/auth/google/callback'
);

export const login = async (req, res) => {
  try {
    // Extraemos el password del body
    const { email, password } = req.body;
    
    // Validamos que ambos campos vengan en la petición
    if (!email || email.trim() === '' || !password || password.trim() === '') {
      return res.status(400).json({ error: 'El email y la contraseña son requeridos' });
    }

    const usuario = await Persona.findOne({ 
      where: { email: email.trim(), activo: true } 
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado o cuenta inactiva' });
    }
    
    // Verificamos que la contraseña plana coincida con el hash de la BD
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    const csrfToken = generarTokenCSRF();
    
    // Agregamos el ROL al payload para proteger rutas después
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol, 
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
    
    // Mandamos el rol al frontend para que Vue sepa si mostrar el menú de Admin
    res.json({
      mensaje: 'Login exitoso',
      usuario: { id: payload.id, email: payload.email, rol: payload.rol },
      csrfToken: csrfToken 
    });
    
  } catch (error) {
    console.error("ERROR REAL EN EL LOGIN:", error);
    res.status(500).json({ error: 'Error en el proceso de login' });
  }
};

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

export const verificarAuth = (req, res) => {
  try {
    // req.usuario ya trae el rol inyectado por el middleware verificarToken
    res.json({
      autenticado: true,
      usuario: req.usuario 
    });
  } catch (error) {
    console.error('Error al verificar auth:', error);
    res.status(500).json({ error: 'Error al verificar autenticación' });
  }
};

// Autenticacion Google Auth
const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://localhost:3000/api/auth/google/callback'
  );
};

export const googleLogin = (req, res) => {
  const oauth2Client = getOAuthClient(); 

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });
  
  res.json({ url: authUrl }); 
};

export const googleCallback = async (req, res) => {
  try {
    const oauth2Client = getOAuthClient(); 
    const { code } = req.query; 

    const { tokens } = await oauth2Client.getToken(code); 
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get(); 
    const userEmail = userInfo.data.email; 

    const usuario = await Persona.findOne({ where: { email: userEmail, activo: true } });

    if (!usuario) {
      return res.redirect(`${process.env.CLIENT_URL}/?login=unauthorized`);
    }

    const csrfToken = generarTokenCSRF(); 
    
    const payload = { 
      id: usuario.id, 
      email: usuario.email,
      rol: usuario.rol, 
      apiKey: process.env.API_KEY,
      csrfToken: csrfToken
    };
    
    const tokenJWT = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    res.cookie('jwt_token', tokenJWT, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });
    
    res.cookie('csrf_token', csrfToken, { 
      secure: true, 
      sameSite: 'none',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });

    res.redirect(`${process.env.CLIENT_URL}/?login=success&csrf=${csrfToken}`);

  } catch (error) {
    console.error("Error en el flujo de Google OAuth:", error);
    res.redirect(`${process.env.CLIENT_URL}/?login=error`);
  }
};