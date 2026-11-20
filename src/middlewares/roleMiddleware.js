const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida'
    });
  }

  if (req.user.rol !== 'administrador') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador para realizar esta acción'
    });
  }

  next();
};

module.exports = {
  requireAdmin
};
