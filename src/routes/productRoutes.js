const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const {
  validateObjectId,
  validateProductInput,
  validateProductUpdateInput
} = require('../middlewares/validateMiddleware');

// Rutas Públicas
// GET /productos - Listar productos (con filtro opcional ?categoria=...)
router.get('/', productController.listarProductos);

// GET /productos/:id - Consultar un producto específico
router.get('/:id', validateObjectId('id'), productController.obtenerProductoPorId);

// Rutas Protegidas - Solo Administrador
// POST /productos - Crear producto
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  validateProductInput,
  productController.crearProducto
);

// PUT /productos/:id - Actualizar producto
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateObjectId('id'),
  validateProductUpdateInput,
  productController.actualizarProducto
);

// DELETE /productos/:id - Eliminar producto
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateObjectId('id'),
  productController.eliminarProducto
);

module.exports = router;
