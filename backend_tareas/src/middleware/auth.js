import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  try {
    const tokenJWT = req.cookies.jwt_token;
    
    if (!tokenJWT) {
      return res.status(401).json({ error: 'Token JWT no proporcionado' });
    }

    const csrfToken = req.headers['x-csrf-token'];
    
    if (!csrfToken) {
      return res.status(401).json({ error: 'Token CSRF no proporcionado' });
    }

    const decoded = jwt.verify(tokenJWT, process.env.JWT_SECRET);
    
    if (decoded.csrfToken !== csrfToken) {
      return res.status(401).json({ error: 'Token CSRF inválido' });
    }

    if (decoded.apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'API Key inválida' });
    }

    // Inyectamos la información del usuario, INCLUYENDO EL ROL
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol, 
      apiKey: decoded.apiKey
    };

    next();
  } catch (error) {
    console.error('Error en verificación de token:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token JWT inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token JWT expirado' });
    }
    
    return res.status(500).json({ error: 'Error en autenticación' });
  }
};

export const validarApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key no proporcionada' });
  }
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'API Key inválida' });
  }
  
  next();
};

// Middleware para bloquear acceso a quienes no sean administradores
export const esAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de Administrador.' });
  }
  next();
};