const mongoose = require('mongoose');
const Product = require('../models/Product');
const Favorite = require('../models/Favorite');

// GET /productos
// Público. Listar productos y filtrar opcionalmente por categoría (?categoria=...)
const listarProductos = async (req, res, next) => {
  try {
    const { categoria } = req.query;
    const filter = {};

    if (categoria && typeof categoria === 'string' && categoria.trim() !== '') {
      // Búsqueda case-insensitive por categoría
      filter.categoria = new RegExp(`^${categoria.trim()}$`, 'i');
    }

    const productos = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: productos.length,
      categoriaFiltro: categoria || null,
      data: productos
    });
  } catch (error) {
    next(error);
  }
};

// GET /productos/:id
// Público. Consultar un producto por su ID
const obtenerProductoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `El ID '${id}' no es válido`
      });
    }

    const producto = await Product.findById(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: `Producto con ID '${id}' no encontrado`
      });
    }

    return res.status(200).json({
      success: true,
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

// POST /productos
// Administrador. Crear un nuevo producto
const crearProducto = async (req, res, next) => {
  try {
    const { nombre, descripcion, categoria, precio } = req.body;

    const nuevoProducto = await Product.create({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria.trim().toLowerCase(),
      precio
    });

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto
    });
  } catch (error) {
    next(error);
  }
};

// PUT /productos/:id
// Administrador. Actualizar un producto existente
const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {};
    const { nombre, descripcion, categoria, precio } = req.body;

    if (nombre !== undefined) updates.nombre = nombre.trim();
    if (descripcion !== undefined) updates.descripcion = descripcion.trim();
    if (categoria !== undefined) updates.categoria = categoria.trim().toLowerCase();
    if (precio !== undefined) updates.precio = precio;

    const productoActualizado = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({
        success: false,
        error: `Producto con ID '${id}' no encontrado para actualizar`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: productoActualizado
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /productos/:id
// Administrador. Eliminar un producto y mantener consistencia eliminando favoritos asociados
const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productoEliminado = await Product.findByIdAndDelete(id);
    if (!productoEliminado) {
      return res.status(404).json({
        success: false,
        error: `Producto con ID '${id}' no encontrado para eliminar`
      });
    }

    // Integridad referencial: eliminar todos los favoritos asociados al producto eliminado
    const eliminadosFavoritos = await Favorite.deleteMany({ producto: id });

    return res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente',
      favoritosEliminadosAsociados: eliminadosFavoritos.deletedCount,
      data: {
        id: productoEliminado._id,
        nombre: productoEliminado.nombre
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
