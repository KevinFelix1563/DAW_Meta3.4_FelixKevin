import crypto from 'crypto';
import jwt from 'jsonwebtoken';
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
    const { email } = req.body;
    
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    const usuario = await Persona.findOne({ 
      where: { email: email.trim(), activo: true } 
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado o cuenta inactiva' });
    }
    
    const csrfToken = generarTokenCSRF();
    
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

// Inicio del Flujo OAuth
export const googleLogin = (req, res) => {
  const oauth2Client = getOAuthClient(); // Instanciamos el cliente aquí

  // Genera URL de autorización con scopes y prompt consent
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

// Procesamiento del Callback
export const googleCallback = async (req, res) => {
  try {
    const oauth2Client = getOAuthClient(); // Instanciamos el cliente aquí nuevamente
    const { code } = req.query; 

    // POST /token (intercambia code por tokens)
    const { tokens } = await oauth2Client.getToken(code); 
    oauth2Client.setCredentials(tokens);

    // GET /userinfo (con access_token)
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get(); 
    const userEmail = userInfo.data.email; 

    // Validar en la tabla de usuarios registrados 
    const usuario = await Persona.findOne({ where: { email: userEmail, activo: true } });

    if (!usuario) {
      // Usuario NO autorizado -> REDIRECT a /?login=unauthorized
      return res.redirect(`${process.env.CLIENT_URL}/?login=unauthorized`);
    }

    // Usuario autorizado -> Genera sessionid y csrfToken
    const csrfToken = generarTokenCSRF(); 
    const payload = { 
      id: usuario.id, 
      email: usuario.email,
      apiKey: process.env.API_KEY,
      csrfToken: csrfToken
    };
    
    // Crea JWT con userSession payload
    const tokenJWT = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    // SET-COOKIE session_token (httpOnly)
    res.cookie('jwt_token', tokenJWT, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });
    
    // SET-COOKIE csrf_token
    res.cookie('csrf_token', csrfToken, { 
      secure: true, 
      sameSite: 'none',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });

    // REDIRECT a /?login=success con csrfToken
    res.redirect(`${process.env.CLIENT_URL}/?login=success&csrf=${csrfToken}`);

  } catch (error) {
    console.error("Error en el flujo de Google OAuth:", error);
    res.redirect(`${process.env.CLIENT_URL}/?login=error`);
  }
};