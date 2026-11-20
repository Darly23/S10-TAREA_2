const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Ruta informativa de bienvenida / Healthcheck
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API REST de Catálogo de Productos y Favoritos con RBAC y JWT',
    version: '1.0.0',
    endpoints: {
      auth: {
        registro: 'POST /api/auth/registro (o /auth/registro)',
        login: 'POST /api/auth/login (o /auth/login)'
      },
      productos: {
        listar: 'GET /api/productos [Público, filtro opcional: ?categoria=tecnologia]',
        consultar: 'GET /api/productos/:id [Público]',
        crear: 'POST /api/productos [Admin]',
        actualizar: 'PUT /api/productos/:id [Admin]',
        eliminar: 'DELETE /api/productos/:id [Admin]'
      },
      favoritos: {
        listar: 'GET /api/favoritos [Autenticado]',
        agregar: 'POST /api/favoritos [Autenticado]',
        eliminar: 'DELETE /api/favoritos/:productoId [Autenticado]'
      }
    }
  });
});

// Montaje de rutas con y sin prefijo /api para máxima compatibilidad
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/productos', productRoutes);
app.use('/productos', productRoutes);

app.use('/api/favoritos', favoriteRoutes);
app.use('/favoritos', favoriteRoutes);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
