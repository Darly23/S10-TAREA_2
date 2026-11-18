const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [150, 'El nombre no puede exceder 150 caracteres']
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción del producto es obligatoria'],
      trim: true,
      minlength: [5, 'La descripción debe tener al menos 5 caracteres'],
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría del producto es obligatoria'],
      trim: true,
      lowercase: true,
      minlength: [2, 'La categoría debe tener al menos 2 caracteres']
    },
    precio: {
      type: Number,
      required: [true, 'El precio del producto es obligatorio'],
      validate: {
        validator: function (val) {
          return typeof val === 'number' && !isNaN(val) && val > 0;
        },
        message: 'El precio debe ser un número mayor que cero (0)'
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Índice para optimizar búsquedas por categoría
productSchema.index({ categoria: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
