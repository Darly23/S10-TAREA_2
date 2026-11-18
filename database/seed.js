require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Favorite = require('../src/models/Favorite');
const { connectDB } = require('../src/config/db');

const initialProducts = [
  {
    nombre: 'Laptop Pro 16" Ultrabook',
    descripcion: 'Portátil de alto rendimiento con procesador de última generación, 32GB RAM y 1TB SSD.',
    categoria: 'computacion',
    precio: 1499.99
  },
  {
    nombre: 'Auriculares Inalámbricos Noise Cancelling',
    descripcion: 'Auriculares over-ear con cancelación activa de ruido híbrida, audio Hi-Res y batería de 40 horas.',
    categoria: 'audio',
    precio: 199.50
  },
  {
    nombre: 'Teclado Mecánico RGB Hot-Swappable',
    descripcion: 'Teclado compacto 75% con interruptores mecánicos lubricados y retroiluminación RGB configurable.',
    categoria: 'accesorios',
    precio: 89.90
  },
  {
    nombre: 'Monitor Gamer 27" QHD 165Hz',
    descripcion: 'Pantalla IPS con resolución 2560x1440, 1ms de tiempo de respuesta y compatibilidad G-Sync.',
    categoria: 'monitores',
    precio: 349.00
  },
  {
    nombre: 'Smartwatch Fitness Pro Sensor SpO2',
    descripcion: 'Reloj inteligente resistente al agua (5ATM) con GPS integrado, medición de ritmo cardíaco y sueño.',
    categoria: 'wearables',
    precio: 129.99
  },
  {
    nombre: 'Silla Ergonómica de Oficina Regulable',
    descripcion: 'Silla con soporte lumbar adaptable, apoyabrazos 3D y malla transpirable de alta durabilidad.',
    categoria: 'muebles',
    precio: 219.00
  }
];

const seedData = async () => {
  try {
    console.log('[Seed] Conectando a la base de datos...');
    await connectDB();

    console.log('[Seed] Limpiando colecciones anteriores...');
    await Favorite.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Creando usuario Administrador...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@catalogo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';
    const adminName = process.env.ADMIN_NAME || 'Administrador General';

    const admin = await User.create({
      nombre: adminName,
      correo: adminEmail,
      password: adminPassword,
      rol: 'administrador'
    });
    console.log(`[Seed] Administrador creado: ${admin.correo} (Rol: ${admin.rol})`);

    console.log('[Seed] Creando usuarios de prueba para aislamiento (Usuario A y Usuario B)...');
    const userA = await User.create({
      nombre: 'Usuario Demo A',
      correo: 'usuarioA@catalogo.com',
      password: 'UserA1234!',
      rol: 'usuario'
    });
    console.log(`[Seed] Usuario A creado: ${userA.correo}`);

    const userB = await User.create({
      nombre: 'Usuario Demo B',
      correo: 'usuarioB@catalogo.com',
      password: 'UserB1234!',
      rol: 'usuario'
    });
    console.log(`[Seed] Usuario B creado: ${userB.correo}`);

    console.log('[Seed] Insertando catálogo inicial de productos...');
    const insertedProducts = await Product.insertMany(initialProducts);
    console.log(`[Seed] ${insertedProducts.length} productos insertados con éxito.`);

    console.log('[Seed] Asociando favorito inicial de prueba para Usuario A...');
    await Favorite.create({
      usuario: userA._id,
      producto: insertedProducts[0]._id
    });
    console.log(`[Seed] Favorito creado para Usuario A -> Producto: "${insertedProducts[0].nombre}"`);

    console.log('\n======================================================');
    console.log(' SEED COMPLETADO EXITOSAMENTE');
    console.log(' Credenciales disponibles:');
    console.log(` - Admin:    ${admin.correo} | Password: ${adminPassword} | Rol: administrador`);
    console.log(` - Usuario A: ${userA.correo} | Password: UserA1234! | Rol: usuario`);
    console.log(` - Usuario B: ${userB.correo} | Password: UserB1234! | Rol: usuario`);
    console.log(` - Productos cargados: ${insertedProducts.length}`);
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error durante la inicialización:', error);
    process.exit(1);
  }
};

seedData();
