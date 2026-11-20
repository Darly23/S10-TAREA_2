const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Todas las rutas de favoritos requieren usuario autenticado
router.use(authenticateToken);

// GET /favoritos - Listar favoritos personales
router.get('/', favoriteController.listarFavoritos);

// POST /favoritos - Agregar producto a favoritos
router.post('/', favoriteController.agregarFavorito);

// DELETE /favoritos/:productoId - Quitar producto de favoritos
router.delete('/:productoId', favoriteController.quitarFavorito);

module.exports = router;
