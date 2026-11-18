const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/catalogo_db';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Conectado exitosamente a: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Error al conectar a la base de datos: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Conexión cerrada.');
  } catch (error) {
    console.error(`[MongoDB] Error al cerrar conexión: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
