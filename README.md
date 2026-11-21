# Catálogo de Productos con Favoritos y Acceso por Roles (RBAC)

API REST robusta desarrollada con **Node.js**, **Express** y **MongoDB (Mongoose)** que implementa autenticación basada en **JSON Web Tokens (JWT)**, autorización y control de acceso basado en roles (**RBAC**), gestión de catálogo público de productos, gestión de favoritos personales con estricto aislamiento entre usuarios y consistencia referencial con eliminación en cascada.

---

##  Información del Proyecto

- **Materia / Curso:** Desarrollo Web Backend / Programación Web
- **Actividad:** Catálogo de productos con favoritos y acceso por roles (Semana 10 - Tarea 2)
- **Estudiante / Desarrollador:** Darly (Darly23)
- **Repositorio Público en GitHub:** [https://github.com/Darly23/S10-TAREA_2](https://github.com/Darly23/S10-TAREA_2)

---

##  Propósito del Proyecto

El propósito de esta API es ofrecer un servicio backend seguro, escalable y modular para un comercio electrónico o plataforma de catálogo, donde coexisten dos niveles de acceso claramente delimitados:
1. **Público general / Clientes:** Pueden explorar el catálogo de productos y filtrar por categoría sin necesidad de registrarse.
2. **Usuarios autenticados (`usuario`):** Pueden iniciar sesión para gestionar su propia lista privada de favoritos personales (agregar, listar y quitar productos). Un usuario jamás puede ver ni modificar los favoritos de otro usuario.
3. **Administradores (`administrador`):** Tienen permisos privilegiados exclusivos para realizar operaciones CRUD (crear, actualizar y eliminar) sobre el catálogo de productos.

---

##  Elección y Justificación de la Base de Datos

Se evaluaron las dos alternativas propuestas por la cátedra (**MongoDB con Mongoose** frente a **PostgreSQL con pg**) y se seleccionó formalmente **MongoDB con Mongoose** por las siguientes razones técnicas:

| Criterio | Justificación Técnica de la Elección (MongoDB + Mongoose) |
| :--- | :--- |
| **Modelado y Esquemas** | Mongoose permite definir esquemas estrictos a nivel de aplicación con validaciones nativas (`min`, `required`, expresiones regulares para correo y validadores personalizados para precios mayores a cero). |
| **Coincidencia con formato JSON** | Los documentos BSON/JSON de MongoDB se integran de forma natural con Express y JavaScript sin necesidad de conversiones complejas entre registros tabulares y objetos (evitando el desfase objeto-relacional). |
| **Seguridad e Inyección** | El Object Document Mapper (ODM) abstrae la construcción de consultas, mitigando vulnerabilidades clásicas de inyección SQL mediante parseo estricto de tipos de datos. |
| **Poblado y Relaciones** | Mongoose proporciona `.populate()`, lo que permite vincular la colección de favoritos con los productos de manera fluida y declarativa, conservando índices únicos compuestos (`usuario + producto`). |
| **Flexibilidad de Despliegue** | Es compatible de forma transparente tanto con instancias locales (`mongodb://127.0.0.1:27017`) como con clústeres en la nube (**MongoDB Atlas**), facilitando la portabilidad del proyecto sin requerir configuración manual de motores relacionales. |

> *(Nota: Para fines académicos y de equivalencia, se incluye además en el repositorio el archivo `database/schema.sql` con el diseño relacional DDL correspondiente en PostgreSQL).*

---

##  Arquitectura y Estructura del Proyecto

El proyecto sigue una arquitectura en capas (**MVC - Rutas, Controladores, Modelos y Middlewares**), garantizando separación de responsabilidades y alta mantenibilidad:

```text
S10-TAREA_2/
├── .env.example                               # Plantilla de variables de entorno sin secretos
├── .env                                       # Variables de entorno locales (ignorado en git)
├── .gitignore                                 # Exclusiones de Git (node_modules, .env, logs)
├── package.json                               # Dependencias, scripts y metadatos
├── package-lock.json                          # Bloqueo de versiones reproducibles
├── README.md                                  # Documentación técnica completa
├── database/
│   ├── seed.js                                # Script de inicialización (admin, usuarios y 6 productos)
│   └── schema.sql                             # Esquema DDL SQL relacional equivalente
├── postman/
│   ├── Catalogo_Productos_API.postman_collection.json   # Colección completa de pruebas con aserciones
│   └── Catalogo_Productos_Local.postman_environment.json # Entorno de variables sin secretos
├── src/
│   ├── app.js                                 # Configuración de Express, middlewares y rutas
│   ├── server.js                              # Punto de entrada y arranque del servidor HTTP
│   ├── config/
│   │   └── db.js                              # Conexión asíncrona a MongoDB con Mongoose
│   ├── controllers/
│   │   ├── authController.js                  # Lógica de registro y login con emisión de JWT
│   │   ├── productController.js               # CRUD de productos y filtro por categoría
│   │   └── favoriteController.js              # Gestión de favoritos y aislamiento por usuario
│   ├── middlewares/
│   │   ├── authMiddleware.js                  # Verificación y validación de firma y vencimiento JWT
│   │   ├── roleMiddleware.js                  # Autorización estricta por rol (solo administrador)
│   │   ├── validateMiddleware.js              # Validación de entradas, tipos de datos y ObjectIds
│   │   └── errorMiddleware.js                 # Manejador centralizado de errores y rutas 404
│   ├── models/
│   │   ├── User.js                            # Esquema de Usuario (hash bcrypt y toJSON seguro)
│   │   ├── Product.js                         # Esquema de Producto (precio > 0, categoría)
│   │   └── Favorite.js                        # Esquema de Favorito (índice único compuesto)
│   └── routes/
│       ├── authRoutes.js                      # Rutas /api/auth
│       ├── productRoutes.js                   # Rutas /api/productos
│       └── favoriteRoutes.js                  # Rutas /api/favoritos
└── tests/
    └── api.test.js                            # 30 pruebas automatizadas end-to-end con Jest y Supertest
```

---

##  Requisitos Previos

- **Node.js:** Versión 18.x o superior (verificar con `node -v`).
- **NPM:** Gestor de paquetes de Node (verificar con `npm -v`).
- **Base de Datos:** Instancia local de MongoDB en ejecución (`localhost:27017`) o cadena de conexión a **MongoDB Atlas**.
- **Postman:** Para la ejecución manual o visual de la colección de pruebas.

---

##  Instalación y Puesta en Marcha

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Darly23/S10-TAREA_2.git
cd S10-TAREA_2
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Copie el archivo `.env.example` y cree su archivo local `.env`:
```bash
cp .env.example .env
```
Contenido recomendado de `.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/catalogo_db
JWT_SECRET=super_secreto_para_firmar_jwt_seguro_2026
JWT_EXPIRES_IN=24h

ADMIN_NAME=Administrador General
ADMIN_EMAIL=admin@catalogo.com
ADMIN_PASSWORD=Admin1234!
```

### 4. Inicialización de Datos (Seed)
Ejecute el script de inicialización para crear el usuario **Administrador**, dos usuarios de prueba (**Usuario A** y **Usuario B**) y el catálogo inicial de **6 productos ficticios**:
```bash
npm run seed
```

> **Salida esperada:**
> ```text
> [Seed] Conectando a la base de datos...
> [Seed] Limpiando colecciones anteriores...
> [Seed] Creando usuario Administrador...
> [Seed] Administrador creado: admin@catalogo.com (Rol: administrador)
> [Seed] Creando usuarios de prueba para aislamiento (Usuario A y Usuario B)...
> [Seed] Insertando catálogo inicial de productos...
> [Seed] 6 productos insertados con éxito.
> ======================================================
>  SEED COMPLETADO EXITOSAMENTE
> ======================================================
> ```

### 5. Iniciar la API
- **Modo Desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```
- **Modo Producción:**
  ```bash
  npm start
  ```
El servidor quedará disponible en: `http://localhost:3000` (con endpoints bajo `/api` o directamente en la raíz).

### 6. Ejecutar las Pruebas Automatizadas (Jest + Supertest)
El proyecto incluye **30 pruebas automatizadas** que validan todos los casos exigidos (incluyendo un servidor MongoDB en memoria para pruebas reproducibles e independientes de la base local):
```bash
npm test
```

---

## 

1. **Hash de contraseñas:** Implementado mediante `bcryptjs` con 10 rondas de salt antes de persistir en MongoDB.
2. **Protección de salida de datos:** Los modelos eliminan automáticamente la propiedad `password` en el método `.toJSON()`, garantizando que **jamás se expongan contraseñas ni sus hashes**.
3. **Registro público:** Asigna forzosamente `rol: "usuario"`. Cualquier intento de enviar `rol: "administrador"` desde el cuerpo de la petición es ignorado.
4. **Firma y expiración de JWT:** Se firma con `jsonwebtoken` incluyendo `id`, `correo` y `rol` con tiempo de vida configurable (`24h`).
5. **Aislamiento en Favoritos:** La identidad del usuario se extrae **exclusivamente de `req.user.id`** proveniente del token verificado. No se acepta ningún identificador de usuario en el cuerpo ni en los parámetros.

---

##  Catálogo de Endpoints y Documentación de la API

La API acepta tanto rutas con prefijo `/api` como sin él (`/api/productos` o `/productos`).

### 1. Autenticación (`/api/auth`)

#### `POST /api/auth/registro`
- **Acceso:** Público.
- **Propósito:** Registrar un usuario nuevo con rol `usuario`.
- **Cuerpo (JSON):**
  ```json
  {
    "nombre": "Carlos Gómez",
    "correo": "carlos@ejemplo.com",
    "password": "Password123!"
  }
  ```
- **Respuesta Exitosa (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Usuario registrado exitosamente",
    "data": {
      "id": "673b5f4...",
      "nombre": "Carlos Gómez",
      "correo": "carlos@ejemplo.com",
      "rol": "usuario",
      "createdAt": "2026-11-18T17:00:00.000Z"
    }
  }
  ```
- **Errores:**
  - `400 Bad Request`: Campos vacíos o formato de correo inválido.
  - `409 Conflict`: El correo electrónico ya se encuentra registrado.

#### `POST /api/auth/login`
- **Acceso:** Público.
- **Propósito:** Validar credenciales y emitir un JWT firmado.
- **Cuerpo (JSON):**
  ```json
  {
    "correo": "admin@catalogo.com",
    "password": "Admin1234!"
  }
  ```
- **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Inicio de sesión exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "673b5f1...",
      "nombre": "Administrador General",
      "correo": "admin@catalogo.com",
      "rol": "administrador"
    }
  }
  ```
- **Errores:**
  - `400 Bad Request`: Correo o contraseña no proporcionados.
  - `401 Unauthorized`: Credenciales inválidas.

---

### 2. Catálogo de Productos (`/api/productos`)

#### `GET /api/productos`
- **Acceso:** Público.
- **Propósito:** Listar productos del catálogo. Permite filtrar opcionalmente por categoría vía query param.
- **Ejemplo con filtro:** `GET /api/productos?categoria=monitores`
- **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "success": true,
    "total": 1,
    "categoriaFiltro": "monitores",
    "data": [
      {
        "_id": "673b5f2...",
        "nombre": "Monitor Gamer 27\" QHD 165Hz",
        "descripcion": "Pantalla IPS con resolución 2560x1440, 1ms y G-Sync.",
        "categoria": "monitores",
        "precio": 349.00,
        "createdAt": "2026-11-18T17:00:00.000Z"
      }
    ]
  }
  ```

#### `GET /api/productos/:id`
- **Acceso:** Público.
- **Propósito:** Consultar el detalle de un producto específico por su identificador.
- **Respuesta Exitosa (`200 OK`):** Devuelve el objeto del producto.
- **Errores:**
  - `400 Bad Request`: Formato de ID inválido.
  - `404 Not Found`: Producto no encontrado.

#### `POST /api/productos`
- **Acceso:** Protegido (**Solo Administrador**).
- **Cabecera obligatoria:** `Authorization: Bearer <TOKEN_ADMIN>`
- **Cuerpo (JSON):**
  ```json
  {
    "nombre": "Micrófono de Estudio USB",
    "descripcion": "Micrófono condensador cardioide para grabación",
    "categoria": "audio",
    "precio": 115.50
  }
  ```
- **Respuesta Exitosa (`201 Created`):** Objeto creado con su `_id`.
- **Errores:**
  - `401 Unauthorized`: Token no enviado o inválido.
  - `403 Forbidden`: Token válido pero perteneciente a un usuario sin rol de administrador.
  - `400 Bad Request`: Campos vacíos o `precio <= 0`.

#### `PUT /api/productos/:id`
- **Acceso:** Protegido (**Solo Administrador**).
- **Propósito:** Actualizar campos de un producto existente.
- **Respuesta Exitosa (`200 OK`):** Objeto actualizado.
- **Errores:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `400 Bad Request`.

#### `DELETE /api/productos/:id`
- **Acceso:** Protegido (**Solo Administrador**).
- **Propósito:** Eliminar un producto del catálogo y **mantener consistencia eliminando automáticamente todos los favoritos que lo referencian**.
- **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Producto eliminado exitosamente",
    "favoritosEliminadosAsociados": 2,
    "data": {
      "id": "673b5f2...",
      "nombre": "Micrófono de Estudio USB"
    }
  }
  ```

---

### 3. Favoritos Personales (`/api/favoritos`)

Todas las rutas de favoritos requieren cabecera `Authorization: Bearer <TOKEN>`.

#### `GET /api/favoritos`
- **Acceso:** Autenticado (`usuario` o `administrador`).
- **Propósito:** Obtener la lista de productos favoritos del usuario que hace la petición.
- **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "success": true,
    "total": 1,
    "usuario": {
      "id": "673b5f3...",
      "nombre": "Usuario Demo A",
      "correo": "usuarioA@catalogo.com"
    },
    "data": [
      {
        "_id": "673b5f5...",
        "usuario": "673b5f3...",
        "producto": {
          "_id": "673b5f2...",
          "nombre": "Laptop Pro 16\" Ultrabook",
          "precio": 1499.99,
          "categoria": "computacion"
        },
        "createdAt": "2026-11-18T17:00:00.000Z"
      }
    ]
  }
  ```

#### `POST /api/favoritos`
- **Acceso:** Autenticado.
- **Propósito:** Agregar un producto a la lista de favoritos personal.
- **Cuerpo (JSON):**
  ```json
  {
    "productoId": "673b5f2..."
  }
  ```
- **Respuesta Exitosa (`201 Created`):** Favorito creado con producto populado.
- **Errores:**
  - `400 Bad Request`: `productoId` ausente o con formato inválido.
  - `404 Not Found`: El producto especificado no existe en el catálogo.
  - `409 Conflict`: El producto ya está en la lista de favoritos del usuario.

#### `DELETE /api/favoritos/:productoId`
- **Acceso:** Autenticado.
- **Propósito:** Quitar un producto de los favoritos del usuario autenticado.
- **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Producto eliminado de favoritos exitosamente",
    "data": {
      "productoId": "673b5f2..."
    }
  }
  ```
- **Errores:**
  - `404 Not Found`: El producto no se encuentra en la lista de favoritos del usuario autenticado (garantiza aislamiento).

---

##  Pruebas Obligatorias con Postman

En la carpeta [`postman/`](./postman/) se incluyen los dos archivos listos para importar:
1. **Colección:** [`Catalogo_Productos_API.postman_collection.json`](./postman/Catalogo_Productos_API.postman_collection.json)
2. **Entorno:** [`Catalogo_Productos_Local.postman_environment.json`](./postman/Catalogo_Productos_Local.postman_environment.json)

### Pasos para Ejecutar en Postman:
1. Abrir Postman y hacer clic en **Import**.
2. Seleccionar los dos archivos mencionados de la carpeta `postman/`.
3. Seleccionar en la esquina superior derecha el entorno: **Catálogo Productos - Local**.
4. Iniciar el servidor local (`npm run dev` o `npm start`).
5. Ejecutar la colección completa con el **Collection Runner** o petición por petición en el orden establecido:
   - **01. Autenticación y Registro:** Registra usuarios, prueba rechazo de duplicados (409) y guarda automáticamente los tokens `token_user_a`, `token_user_b` y `token_admin`.
   - **02. Catálogo de Productos:** Consultas públicas, filtro por categoría y captura automática del `producto_id`.
   - **03. Control de Acceso por Roles (RBAC):** Demuestra 401 sin token, 403 con usuario normal, y CRUD completo con administrador.
   - **04. Favoritos y Aislamiento:** Demuestra creación, rechazo de duplicado (409), rechazo de producto inexistente (404), y **el aislamiento estricto donde el Usuario B no puede ver ni borrar el favorito del Usuario A**.
   - **05. Persistencia tras Reinicio:** Detenga el servidor con `Ctrl + C`, inícielo de nuevo y ejecute la petición de persistencia para verificar que los datos permanecen intactos.

---

##  Criterio de Códigos de Estado HTTP Utilizados

| Código HTTP | Nombre | Criterio y Contexto de Uso en la API |
| :---: | :--- | :--- |
| **`200 OK`** | Éxito | Consultas (`GET`), actualizaciones exitosas (`PUT`) y eliminaciones con mensaje descriptivo (`DELETE`). |
| **`201 Created`** | Creado | Creación exitosa de un nuevo recurso (`POST /auth/registro`, `POST /productos`, `POST /favoritos`). |
| **`400 Bad Request`** | Solicitud Inválida | Errores de sintaxis del cliente: campos requeridos vacíos, precio `<= 0` o identificadores con formato no válido de ObjectId. |
| **`401 Unauthorized`** | No Autorizado | Petición a ruta protegida sin cabecera `Authorization`, token con firma manipulada o token expirado. |
| **`403 Forbidden`** | Prohibido | Usuario autenticado válidamente pero sin los privilegios requeridos (ej. rol `usuario` intentando crear/modificar/eliminar productos). |
| **`404 Not Found`** | No Encontrado | Recurso solicitado inexistente (producto no existe en catálogo o favorito no existe en la lista del usuario). |
| **`409 Conflict`** | Conflicto | Infracción de restricción de unicidad: intento de registrar un correo ya existente o agregar un producto que ya es favorito. |



