-- ====================================================================
-- Script SQL DDL de Referencia y Equivalencia Relacional (PostgreSQL)
-- Proyecto: Catálogo de Productos con Favoritos y Roles (RBAC)
-- ====================================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'administrador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para optimizar filtros por categoría
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (categoria);

-- 3. Tabla de Favoritos (Relación N:M entre Usuarios y Productos)
CREATE TABLE IF NOT EXISTS favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_producto UNIQUE (usuario_id, producto_id)
);

-- Índice para optimizar búsquedas de favoritos por usuario
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos (usuario_id);

-- ====================================================================
-- Datos Iniciales (Seed de prueba)
-- ====================================================================

-- Usuario Administrador (Password: Admin1234! hasheado con bcrypt)
INSERT INTO usuarios (nombre, correo, password, rol) 
VALUES ('Administrador General', 'admin@catalogo.com', '$2a$10$wKxM3bK5Y3UoX5aB6D.KXe0gR2u4GZ7Y4Ie9UqU8TzC5jK4QYv5zO', 'administrador')
ON CONFLICT (correo) DO NOTHING;

-- Usuarios Estándar de Prueba
INSERT INTO usuarios (nombre, correo, password, rol) 
VALUES 
('Usuario Demo A', 'usuarioA@catalogo.com', '$2a$10$wKxM3bK5Y3UoX5aB6D.KXe0gR2u4GZ7Y4Ie9UqU8TzC5jK4QYv5zO', 'usuario'),
('Usuario Demo B', 'usuarioB@catalogo.com', '$2a$10$wKxM3bK5Y3UoX5aB6D.KXe0gR2u4GZ7Y4Ie9UqU8TzC5jK4QYv5zO', 'usuario')
ON CONFLICT (correo) DO NOTHING;

-- Catálogo de 6 Productos de Prueba
INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES
('Laptop Pro 16" Ultrabook', 'Portátil de alto rendimiento con procesador de última generación, 32GB RAM y 1TB SSD.', 'computacion', 1499.99),
('Auriculares Inalámbricos Noise Cancelling', 'Auriculares over-ear con cancelación activa de ruido híbrida y batería de 40 horas.', 'audio', 199.50),
('Teclado Mecánico RGB Hot-Swappable', 'Teclado compacto 75% con interruptores mecánicos y retroiluminación RGB.', 'accesorios', 89.90),
('Monitor Gamer 27" QHD 165Hz', 'Pantalla IPS con resolución 2560x1440 y 1ms de tiempo de respuesta.', 'monitores', 349.00),
('Smartwatch Fitness Pro Sensor SpO2', 'Reloj inteligente con GPS integrado y sensor de ritmo cardíaco.', 'wearables', 129.99),
('Silla Ergonómica de Oficina Regulable', 'Silla con soporte lumbar adaptable y malla transpirable.', 'muebles', 219.00);
