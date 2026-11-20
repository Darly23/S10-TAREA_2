// Manejador para rutas no encontradas (404)
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

// Manejador centralizado de errores
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Error interno del servidor';

  // Manejo de error de duplicados en MongoDB (código 11000) -> 409 Conflict
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'campo';
    if (field === 'correo') {
      message = 'El correo electrónico ya se encuentra registrado en el sistema';
    } else if (err.keyPattern && err.keyPattern.usuario && err.keyPattern.producto) {
      message = 'El producto ya se encuentra en la lista de favoritos del usuario';
    } else {
      message = `Conflicto: ya existe un registro con el valor especificado para ${field}`;
    }
  }

  // Manejo de errores de validación de Mongoose -> 400 Bad Request
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(statusCode).json({
      success: false,
      error: 'Error de validación en la base de datos',
      detalles: details
    });
  }

  // Manejo de errores de Cast de Mongoose (IDs inválidos) -> 400 Bad Request
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Formato inválido para el campo: ${err.path}`;
  }

  // Respuesta de error consistente y segura
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
