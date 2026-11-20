const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generador de Token JWT firmado
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'super_secreto_para_firmar_jwt_seguro_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(
    {
      id: user._id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    },
    secret,
    { expiresIn }
  );
};

// POST /auth/registro
// Público. Siempre crea usuarios con rol 'usuario'
const registro = async (req, res, next) => {
  try {
    const { nombre, correo, password } = req.body;

    // Verificar si el correo ya existe para retornar 409 Conflict explícito
    const existingUser = await User.findOne({ correo: correo.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'El correo electrónico ya se encuentra registrado'
      });
    }

    // Regla estricta: El registro público SIEMPRE asigna rol 'usuario'
    // Se ignora cualquier valor de 'rol' que el cliente intente enviar
    const nuevoUsuario = await User.create({
      nombre: nombre.trim(),
      correo: correo.toLowerCase().trim(),
      password,
      rol: 'usuario'
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        createdAt: nuevoUsuario.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login
// Público. Valida credenciales y emite un JWT
const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    // Buscar usuario por correo
    const user = await User.findOne({ correo: correo.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Correo o contraseña incorrectos'
      });
    }

    // Validar contraseña hasheada
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Correo o contraseña incorrectos'
      });
    }

    // Generar JWT firmado
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registro,
  login
};
