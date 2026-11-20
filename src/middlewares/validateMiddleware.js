const mongoose = require('mongoose');

// Valida que el parámetro en la URL sea un ObjectId válido de MongoDB
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `El identificador '${paramName}' (${id}) no tiene un formato válido de ID`
      });
    }
    next();
  };
};

// Valida campos para registro de usuario
const validateRegisterInput = (req, res, next) => {
  const { nombre, correo, password } = req.body;
  const errors = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errors.push('El campo "nombre" es obligatorio y debe tener al menos 2 caracteres');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correo || typeof correo !== 'string' || !emailRegex.test(correo.trim())) {
    errors.push('El campo "correo" es obligatorio y debe tener un formato de email válido');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('El campo "password" es obligatorio y debe tener al menos 6 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación de datos',
      detalles: errors
    });
  }

  next();
};

// Valida credenciales de login
const validateLoginInput = (req, res, next) => {
  const { correo, password } = req.body;
  const errors = [];

  if (!correo || typeof correo !== 'string' || correo.trim() === '') {
    errors.push('El campo "correo" es obligatorio');
  }

  if (!password || typeof password !== 'string' || password === '') {
    errors.push('El campo "password" es obligatorio');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación de credenciales',
      detalles: errors
    });
  }

  next();
};

// Valida datos al crear un producto
const validateProductInput = (req, res, next) => {
  const { nombre, descripcion, categoria, precio } = req.body;
  const errors = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errors.push('El campo "nombre" es obligatorio y no puede estar vacío');
  }

  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 5) {
    errors.push('El campo "descripcion" es obligatorio y debe tener al menos 5 caracteres');
  }

  if (!categoria || typeof categoria !== 'string' || categoria.trim().length < 2) {
    errors.push('El campo "categoria" es obligatorio y no puede estar vacío');
  }

  if (precio === undefined || precio === null || typeof precio !== 'number' || isNaN(precio) || precio <= 0) {
    errors.push('El campo "precio" es obligatorio y debe ser un número mayor a cero (0)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación en los datos del producto',
      detalles: errors
    });
  }

  next();
};

// Valida datos al actualizar un producto
const validateProductUpdateInput = (req, res, next) => {
  const { nombre, descripcion, categoria, precio } = req.body;
  const errors = [];

  if (req.body && Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Debe enviar al menos un campo para actualizar'
    });
  }

  if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length < 2)) {
    errors.push('El campo "nombre" debe ser una cadena de al menos 2 caracteres');
  }

  if (descripcion !== undefined && (typeof descripcion !== 'string' || descripcion.trim().length < 5)) {
    errors.push('El campo "descripcion" debe tener al menos 5 caracteres');
  }

  if (categoria !== undefined && (typeof categoria !== 'string' || categoria.trim().length < 2)) {
    errors.push('El campo "categoria" no puede estar vacío');
  }

  if (precio !== undefined && (typeof precio !== 'number' || isNaN(precio) || precio <= 0)) {
    errors.push('El campo "precio" debe ser un número mayor a cero (0)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación en la actualización del producto',
      detalles: errors
    });
  }

  next();
};

module.exports = {
  validateObjectId,
  validateRegisterInput,
  validateLoginInput,
  validateProductInput,
  validateProductUpdateInput
};
