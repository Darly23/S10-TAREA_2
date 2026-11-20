require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Documentación de endpoints en http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
    return server;
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { startServer };
