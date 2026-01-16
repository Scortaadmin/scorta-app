# SCORTA Backend API

Backend server para la plataforma SCORTA - Marketplace Premium.

## 🚀 Tecnologías

- **Node.js** + **Express** - Framework del servidor
- **MongoDB** + **Mongoose** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Express Validator** - Validación de requests

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

## ⚙️ Configuración

Edita el archivo `.env` con tus configuraciones:

```env
MONGODB_URI=mongodb://localhost:27017/scorta
JWT_SECRET=tu_secreto_jwt
PORT=5000
```

## 🏃 Ejecutar

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:5000`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios
- `GET /api/users/me` - Perfil del usuario
- `PUT /api/users/me` - Actualizar perfil
- `DELETE /api/users/me` - Eliminar cuenta

### Perfiles
- `GET /api/profiles` - Listar perfiles (con filtros)
- `GET /api/profiles/:id` - Obtener perfil
- `POST /api/profiles` - Crear perfil
- `PUT /api/profiles/:id` - Actualizar perfil
- `DELETE /api/profiles/:id` - Eliminar perfil
- `POST /api/profiles/:id/view` - Incrementar vistas

### Favoritos
- `GET /api/favorites` - Mis favoritos
- `POST /api/favorites/:profileId` - Agregar favorito
- `DELETE /api/favorites/:profileId` - Quitar favorito

### Reseñas
- `GET /api/reviews/:profileId` - Reseñas de un perfil
- `POST /api/reviews/:profileId` - Crear reseña
- `PUT /api/reviews/:id` - Actualizar reseña
- `DELETE /api/reviews/:id` - Eliminar reseña
- `POST /api/reviews/:id/helpful` - Marcar útil

### Mensajes
- `GET /api/messages/conversations` - Conversaciones
- `GET /api/messages/:userId` - Mensajes con usuario
- `POST /api/messages` - Enviar mensaje
- `PUT /api/messages/:id/read` - Marcar como leído

### Pagos
- `POST /api/payments/process` - Procesar pago
- `GET /api/payments/transactions` - Historial
- `GET /api/payments/transactions/:id` - Transacción específica
- `POST /api/payments/refund/:id` - Solicitar reembolso

## 🔒 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## 🧪 Testing

```bash
npm test
```

## 📁 Estructura del Proyecto

```
backend/
├── models/          # Modelos de MongoDB
├── routes/          # Rutas de la API
├── middleware/      # Middleware personalizado
├── utils/           # Utilidades
├── config/          # Configuración
├── server.js        # Punto de entrada
└── .env             # Variables de entorno
```

## 🛡️ Seguridad

- Rate limiting en todas las rutas
- CORS configurado
- Helmet para headers de seguridad
- Validación de inputs
- Contraseñas hasheadas con bcrypt
- JWT para sesiones

## 📝 Notas

- Esta es una versión de desarrollo
- En producción, usar MongoDB Atlas
- Configurar variables de entorno apropiadamente
- Implementar logging robusto para producción
