const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Acceso no autorizado. Token no proporcionado'
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'super_secreto_para_firmar_jwt_seguro_2026';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'El token ha expirado. Inicie sesión nuevamente'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Token inválido o firma no autorizada'
      });
    }

    // Buscar al usuario en la base de datos para verificar que aún existe
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado o ya no existe'
      });
    }

    // Adjuntar usuario autenticado al objeto req
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno en la autenticación'
    });
  }
};

module.exports = {
  authenticateToken
};
