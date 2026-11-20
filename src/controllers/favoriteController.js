const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');

// GET /favoritos
// Autenticado. Listar únicamente los favoritos del usuario autenticado
const listarFavoritos = async (req, res, next) => {
  try {
    const usuarioId = req.user._id;

    const favoritos = await Favorite.find({ usuario: usuarioId })
      .populate('producto')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: favoritos.length,
      usuario: {
        id: req.user._id,
        nombre: req.user.nombre,
        correo: req.user.correo
      },
      data: favoritos
    });
  } catch (error) {
    next(error);
  }
};

// POST /favoritos
// Autenticado. Agregar un producto a la lista de favoritos del usuario autenticado
const agregarFavorito = async (req, res, next) => {
  try {
    const usuarioId = req.user._id;
    const productoId = req.body.productoId || req.body.producto;

    // Validación de presencia y formato del productoId
    if (!productoId) {
      return res.status(400).json({
        success: false,
        error: 'El campo "productoId" es obligatorio'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({
        success: false,
        error: `El productoId '${productoId}' no tiene un formato válido de ID`
      });
    }

    // Verificar que el producto realmente exista en la base de datos (404 si no existe)
    const productoExiste = await Product.findById(productoId);
    if (!productoExiste) {
      return res.status(404).json({
        success: false,
        error: `El producto con ID '${productoId}' no existe en el catálogo`
      });
    }

    // Verificar que no sea duplicado para retornar 409 Conflict explícito
    const favoritoExistente = await Favorite.findOne({
      usuario: usuarioId,
      producto: productoId
    });

    if (favoritoExistente) {
      return res.status(409).json({
        success: false,
        error: 'El producto ya se encuentra en su lista de favoritos'
      });
    }

    // Crear el favorito asociado estrictamente al usuario autenticado
    const nuevoFavorito = await Favorite.create({
      usuario: usuarioId,
      producto: productoId
    });

    await nuevoFavorito.populate('producto');

    return res.status(201).json({
      success: true,
      message: 'Producto agregado a favoritos exitosamente',
      data: nuevoFavorito
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /favoritos/:productoId
// Autenticado. Quitar un producto de los favoritos del usuario autenticado
const quitarFavorito = async (req, res, next) => {
  try {
    const usuarioId = req.user._id;
    const { productoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({
        success: false,
        error: `El identificador de producto '${productoId}' no tiene un formato válido`
      });
    }

    // Aislamiento: Solo se busca y elimina el favorito que pertenezca a ESTE usuario
    const favoritoEliminado = await Favorite.findOneAndDelete({
      usuario: usuarioId,
      producto: productoId
    });

    if (!favoritoEliminado) {
      return res.status(404).json({
        success: false,
        error: 'El producto no se encuentra en su lista de favoritos'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Producto eliminado de favoritos exitosamente',
      data: {
        productoId
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarFavoritos,
  agregarFavorito,
  quitarFavorito
};
