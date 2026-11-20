const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  validateRegisterInput,
  validateLoginInput
} = require('../middlewares/validateMiddleware');

// POST /auth/registro - Registro de usuario estándar
router.post('/registro', validateRegisterInput, authController.registro);

// POST /auth/login - Inicio de sesión y emisión de JWT
router.post('/login', validateLoginInput, authController.login);

module.exports = router;
