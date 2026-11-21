const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Favorite = require('../src/models/Favorite');

let mongoServer;
let adminToken;
let userAToken;
let userBToken;
let testProductId;
let secondProductId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri);

  // Crear usuario Administrador inicial para las pruebas
  const admin = await User.create({
    nombre: 'Admin Pruebas',
    correo: 'admin.test@catalogo.com',
    password: 'AdminPassword123!',
    rol: 'administrador'
  });

  // Obtener token de administrador
  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      correo: 'admin.test@catalogo.com',
      password: 'AdminPassword123!'
    });
  adminToken = adminLoginRes.body.token;

  // Crear 5 productos iniciales de ejemplo
  const p1 = await Product.create({
    nombre: 'Laptop Gamer Ultra',
    descripcion: 'Laptop con tarjeta gráfica dedicada y 16GB de RAM',
    categoria: 'tecnologia',
    precio: 1299.99
  });
  testProductId = p1._id.toString();

  const p2 = await Product.create({
    nombre: 'Monitor 4K IPS 27 pulgadas',
    descripcion: 'Monitor para diseño y productividad con panel IPS y HDR',
    categoria: 'monitores',
    precio: 399.50
  });
  secondProductId = p2._id.toString();

  await Product.create({
    nombre: 'Teclado Mecánico Inalámbrico',
    descripcion: 'Switches táctiles y conexión Bluetooth / 2.4GHz',
    categoria: 'accesorios',
    precio: 75.00
  });

  await Product.create({
    nombre: 'Mouse Óptico Ergonómico',
    descripcion: 'Sensor de alta precisión y batería recargable',
    categoria: 'accesorios',
    precio: 45.99
  });

  await Product.create({
    nombre: 'Auriculares Hi-Fi con Micrófono',
    descripcion: 'Cancelación pasiva de ruido y drivers de 50mm',
    categoria: 'audio',
    precio: 110.00
  });
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('1. Pruebas de Autenticación y Registro', () => {
  test('Debe registrar exitosamente un usuario estándar con rol "usuario" (201 Created)', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({
        nombre: 'Usuario A',
        correo: 'usuarioA@test.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.correo).toBe('usuarioa@test.com');
    expect(res.body.data.rol).toBe('usuario');
    // Asegurar que nunca se devuelve la contraseña ni su hash
    expect(res.body.data).not.toHaveProperty('password');
  });

  test('El registro público debe ignorar si el usuario intenta asignarse rol "administrador"', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({
        nombre: 'Intento Hacker',
        correo: 'hacker@test.com',
        password: 'Password123!',
        rol: 'administrador'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.rol).toBe('usuario');
  });

  test('Debe rechazar el registro con un correo duplicado (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({
        nombre: 'Usuario A Duplicado',
        correo: 'usuarioA@test.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/correo.*registrado/i);
  });

  test('Debe rechazar el registro con campos incompletos o inválidos (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({
        nombre: '',
        correo: 'correo-invalido',
        password: '123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.detalles.length).toBeGreaterThanOrEqual(1);
  });

  test('Debe iniciar sesión correctamente y emitir un JWT (200 OK)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'usuarioA@test.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.rol).toBe('usuario');
    expect(res.body.usuario).not.toHaveProperty('password');
    userAToken = res.body.token;
  });

  test('Debe rechazar el inicio de sesión con contraseña incorrecta (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'usuarioA@test.com',
        password: 'PasswordIncorrecta!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Debe rechazar el inicio de sesión con correo inexistente (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'noexiste@test.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Registro e inicio de sesión de un segundo usuario (Usuario B) para pruebas de aislamiento', async () => {
    const regRes = await request(app)
      .post('/api/auth/registro')
      .send({
        nombre: 'Usuario B',
        correo: 'usuarioB@test.com',
        password: 'Password123!'
      });
    expect(regRes.statusCode).toBe(201);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'usuarioB@test.com',
        password: 'Password123!'
      });
    expect(loginRes.statusCode).toBe(200);
    userBToken = loginRes.body.token;
  });
});

describe('2. Pruebas del Catálogo de Productos y Permisos por Rol', () => {
  test('Cualquier cliente puede listar productos sin autenticarse (200 OK)', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);
  });

  test('Debe permitir filtrar productos por categoría (200 OK)', async () => {
    const res = await request(app).get('/api/productos?categoria=monitores');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.categoriaFiltro).toBe('monitores');
    expect(res.body.data.every((p) => p.categoria.toLowerCase() === 'monitores')).toBe(true);
  });

  test('Debe consultar un producto por su ID públicamente (200 OK)', async () => {
    const res = await request(app).get(`/api/productos/${testProductId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(testProductId);
  });

  test('Debe rechazar la consulta de un producto inexistente con 404 Not Found', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/productos/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('Debe rechazar la consulta con un ID mal formado con 400 Bad Request', async () => {
    const res = await request(app).get('/api/productos/id-invalido-123');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Debe rechazar la creación de producto sin token (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send({
        nombre: 'Nuevo Producto',
        descripcion: 'Descripción del producto',
        categoria: 'hogar',
        precio: 50.0
      });
    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar la creación de producto con token de rol "usuario" (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        nombre: 'Producto No Autorizado',
        descripcion: 'Intento de creación por usuario regular',
        categoria: 'hogar',
        precio: 50.0
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/administrador/i);
  });

  test('Debe rechazar la creación con precio inválido (<= 0) o campos vacíos (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: '',
        descripcion: 'Corta',
        categoria: '',
        precio: -10
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('El administrador puede crear un producto exitosamente (201 Created)', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Cámara Mirrorless 4K',
        descripcion: 'Cámara para fotografía profesional con lente intercambiable',
        categoria: 'fotografia',
        precio: 899.99
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
  });

  test('El administrador puede actualizar un producto existente (200 OK)', async () => {
    const res = await request(app)
      .put(`/api/productos/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        precio: 1199.99,
        descripcion: 'Laptop con descuento especial de temporada'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.precio).toBe(1199.99);
  });

  test('Debe rechazar la actualización de producto con rol "usuario" (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/productos/${testProductId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ precio: 10.0 });
    expect(res.statusCode).toBe(403);
  });

  test('Debe rechazar la eliminación de producto con rol "usuario" (403 Forbidden)', async () => {
    const res = await request(app)
      .delete(`/api/productos/${testProductId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.statusCode).toBe(403);
  });
});

describe('3. Pruebas de Favoritos y Aislamiento entre Usuarios', () => {
  test('Debe rechazar listar favoritos sin token (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/favoritos');
    expect(res.statusCode).toBe(401);
  });

  test('Usuario A puede agregar un producto existente a sus favoritos (201 Created)', async () => {
    const res = await request(app)
      .post('/api/favoritos')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ productoId: testProductId });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.producto._id.toString()).toBe(testProductId);
  });

  test('Debe rechazar agregar un favorito duplicado para el mismo usuario (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/favoritos')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ productoId: testProductId });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/ya se encuentra en su.*favoritos/i);
  });

  test('Debe rechazar agregar como favorito un producto inexistente (404 Not Found)', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post('/api/favoritos')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ productoId: nonExistentId });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('Usuario A lista sus favoritos y ve el producto agregado (200 OK)', async () => {
    const res = await request(app)
      .get('/api/favoritos')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].producto._id.toString()).toBe(testProductId);
  });

  test('AISLAMIENTO: Usuario B lista sus favoritos y NO ve los favoritos de Usuario A (200 OK, total: 0)', async () => {
    const res = await request(app)
      .get('/api/favoritos')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  test('AISLAMIENTO: Usuario B NO puede quitar el favorito de Usuario A (404 Not Found)', async () => {
    const res = await request(app)
      .delete(`/api/favoritos/${testProductId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('AISLAMIENTO: El favorito de Usuario A permanece intacto tras el intento de Usuario B', async () => {
    const res = await request(app)
      .get('/api/favoritos')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].producto._id.toString()).toBe(testProductId);
  });

  test('Usuario A puede quitar exitosamente el producto de sus favoritos (200 OK)', async () => {
    const res = await request(app)
      .delete(`/api/favoritos/${testProductId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Comprobar que la lista de favoritos de A ahora está vacía
    const verifyRes = await request(app)
      .get('/api/favoritos')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(verifyRes.body.total).toBe(0);
  });
});

describe('4. Consistencia Referencial y Eliminación en Cascada', () => {
  test('Al eliminar un producto como administrador, se deben eliminar en cascada sus favoritos asociados', async () => {
    // 1. Usuario A agrega secondProductId a favoritos
    await request(app)
      .post('/api/favoritos')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ productoId: secondProductId });

    // 2. Comprobar que existe el favorito en la BD
    const favCountBefore = await Favorite.countDocuments({ producto: secondProductId });
    expect(favCountBefore).toBe(1);

    // 3. El Administrador elimina el producto
    const deleteRes = await request(app)
      .delete(`/api/productos/${secondProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.statusCode).toBe(200);

    // 4. Comprobar que el producto fue eliminado
    const prodCheck = await Product.findById(secondProductId);
    expect(prodCheck).toBeNull();

    // 5. Comprobar que el favorito asociado fue eliminado automáticamente (eliminación en cascada)
    const favCountAfter = await Favorite.countDocuments({ producto: secondProductId });
    expect(favCountAfter).toBe(0);
  });
});
