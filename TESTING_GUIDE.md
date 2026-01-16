# 🧪 SCORTA - Guía Completa de Testing

## ✅ Pre-requisitos

Antes de empezar, asegúrate de que:
- ✅ MongoDB está corriendo (puerto 27017)
- ✅ Backend está corriendo (puerto 3001)  
- ✅ Base de datos tiene datos de prueba

### Verificar servicios:
```bash
cd backend
./test-services.sh
```

### Poblar base de datos (si está vacía):
```bash
cd backend
npm run seed
```

---

## 📋 Test Suite Completo

### Test 1: Autenticación - Registro ✅

**Pasos:**
1. Abre `index.html` con Live Server
2. Click en "Crear Cuenta"
3. Completa el formulario:
   - Email: `newuser@test.com`
   - Password: `password123`
   - Confirmar Password: `password123`
   - Role: `client`
4. Click "Registrar"

**Resultado Esperado:**
- ✅ Toast: "Cuenta creada exitosamente!"
- ✅ Redirección a pantalla "Explorar"
- ✅ Token JWT guardado en localStorage (`scorta_token`)
- ✅ Network tab muestra: POST `/api/auth/register` → Status 200

**Verificar en MongoDB:**
```bash
mongosh
use scorta
db.users.find({email: "newuser@test.com"}).pretty()
```

---

### Test 2: Autenticación - Login ✅

**Pasos:**
1. Logout si estás autenticado
2. Click en "Iniciar Sesión"
3. Credenciales de prueba:
   - Email: `client@test.com`
   - Password: `password123`
4. Click "Ingresar"

**Resultado Esperado:**
- ✅ Toast: "Bienvenido a SCORTA!"
- ✅ Redirección a "Explorar"
- ✅ Token JWT en localStorage
- ✅ Network: POST `/api/auth/login` → Status 200

---

### Test 3: Profiles - Browsing ✅

**Pasos:**
1. Estar autenticado (usar Test 2)
2. Navegar a "Explorar" (ícono home)
3. Esperar carga de perfiles

**Resultado Esperado:**
- ✅ Aparece spinner de carga brevemente
- ✅ Se muestran 6 perfiles:
  - Valeria (Quito) - Verified
  - Camila (Guayaquil) - Premium
  - Isabella (Manta) - Verified
  - Elena (Quito) - Verified + Premium
  - Sofia (Cuenca) - Verified
  - Gabriela (Machala)
- ✅ Network: GET `/api/profiles` → Status 200
- ✅ Badges visibles (Verificada, Elite)

---

### Test 4: Profiles - Filtros ✅

**Pasos:**
1. En pantalla "Explorar"
2. Probar filtros:
   - **Filtro "Verificadas"**: Click en pestaña
   - **Búsqueda**: Escribir "Quito" en barra
   - **Filtro ciudad**: Seleccionar ciudad del dropdown
   - **Filtro precio**: Ajustar slider de precio

**Resultado Esperado:**
- ✅ Filtro "Verificadas": Muestra solo 4 perfiles
- ✅ Búsqueda "Quito": Muestra Valeria y Elena
- ✅ Network muestra query params: `GET /api/profiles?verified=true`
- ✅ Resultados cambian inmediatamente

---

### Test 5: Profile Detail ✅

**Pasos:**
1. Click en cualquier perfil (ej: Valeria)
2. Verificar que carga la vista detallada

**Resultado Esperado:**
- ✅ Se abre pantalla de detalle del perfil
- ✅ Muestra foto, nombre, edad, ciudad
- ✅ Muestra información completa
- ✅ Network: GET `/api/profiles/:id` → Status 200
- ✅ Network: POST `/api/profiles/:id/view` (incrementa contador)

---

### Test 6: Favorites - Agregar ✅

**Pasos:**
1. Estar en vista detallada de un perfil
2. Click en botón de corazón (favorito)
3. Navegar a "Favoritos" (ícono corazón)

**Resultado Esperado:**
- ✅ Toast: "❤️ Guardado en favoritos"
- ✅ Ícono de corazón se llena/activa
- ✅ Network: POST `/api/favorites/:profileId` → Status 200
- ✅ En "Favoritos": Aparece el perfil guardado

**Verificar en MongoDB:**
```bash
mongosh
use scorta
db.favorites.find().pretty()
```

---

### Test 7: Favorites - Eliminar ✅

**Pasos:**
1. Estar en vista detallada de un perfil favorito
2. Click en botón de corazón nuevamente
3. Verificar en "Favoritos"

**Resultado Esperado:**
- ✅ Toast: "Eliminado de favoritos"
- ✅ Ícono de corazón se vacía
- ✅ Network: DELETE `/api/favorites/:profileId` → Status 200
- ✅ Perfil desaparece de lista de favoritos

---

### Test 8: Reviews - Crear ✅

**Pasos:**
1. Estar autenticado
2. Abrir perfil de Valeria
3. Scroll hasta sección de reseñas
4. Click "Dejar una reseña"
5. Completar formulario:
   - Rating: 5 estrellas
   - Texto: "Excelente servicio, muy profesional"
6. Click "Publicar"

**Resultado Esperado:**
- ✅ Toast: "🚀 Publicando reseña..."
- ✅ Toast: "✅ Reseña publicada con éxito"
- ✅ Network: POST `/api/reviews/:profileId` → Status 200
- ✅ La reseña aparece inmediatamente en la lista
- ✅ Contador de reseñas se actualiza

**Verificar en MongoDB:**
```bash
mongosh
use scorta
db.reviews.find().pretty()
```

---

### Test 9: Reviews - Ver ✅

**Pasos:**
1. Abrir perfil con reseñas (ej: Valeria si creaste una en Test 8)
2. Scroll a sección de reseñas
3. Verificar visualización

**Resultado Esperado:**
- ✅ Network: GET `/api/reviews/:profileId` → Status 200
- ✅ Se muestran todas las reseñas del perfil
- ✅ Muestra: rating (estrellas), texto, fecha, autor
- ✅ Contador muestra número correcto

---

### Test 10: Messaging - Enviar ✅

**Pasos:**
1. Estar autenticado
2. Abrir perfil de Camila
3. Click en botón "Mensaje" o "Chat"
4. Escribir mensaje: "Hola, me gustaría más información"
5. Click enviar o presionar Enter

**Resultado Esperado:**
- ✅ Mensaje se envía inmediatamente
- ✅ Network: POST `/api/messages` → Status 200
- ✅ Campo de texto se limpia
- ✅ Mensaje aparece en el chat

**Verificar en MongoDB:**
```bash
mongosh
use scorta
db.messages.find().pretty()
```

---

### Test 11: Messaging - Recibir ✅

**Pasos:**
1. Abrir conversación con un perfil
2. Verificar que se cargan mensajes históricos

**Resultado Esperado:**
- ✅ Network: GET `/api/messages/:userId` → Status 200
- ✅ Se muestran mensajes enviados y recibidos
- ✅ Mensajes alineados correctamente (sent/received)
- ✅ Scroll automático al último mensaje

---

### Test 12: Persistencia de Datos ✅

**Pasos:**
1. Realizar varias acciones (favoritos, reviews, mensajes)
2. Cerrar la aplicación completamente
3. Reabrir la aplicación
4. Login con las mismas credenciales

**Resultado Esperado:**
- ✅ Favoritos persisten
- ✅ Reviews persisten
- ✅ Mensajes persisten
- ✅ Token JWT mantiene la sesión (si no expiró)

---

## 🔧 Troubleshooting

### Error: "No se encontraron resultados"
**Causa**: Base de datos vacía
**Solución**: 
```bash
cd backend
npm run seed
```

### Error: "Error al cargar perfiles"
**Causa**: Backend no está corriendo o MongoDB desconectado
**Solución**:
```bash
# Verificar servicios
cd backend
./test-services.sh

# Reiniciar backend si es necesario
npm run dev
```

### Error: "Debes iniciar sesión"
**Causa**: Token JWT expirado o no válido
**Solución**:
1. Logout
2. Login nuevamente con `client@test.com` / `password123`

### Error: 401 Unauthorized
**Causa**: Intentando acceder a ruta protegida sin autenticación
**Solución**: Asegúrate de estar logueado y tener token válido en localStorage

### Error de CORS
**Causa**: Frontend y backend en dominios diferentes
**Solución**: Ya configurado con `CORS_ORIGIN=*` en `.env`

---

## 📊 Checklist de Testing

Marca cada test al completarlo:

- [ ] Test 1: Registro de usuario
- [ ] Test 2: Login de usuario
- [ ] Test 3: Browsing de perfiles
- [ ] Test 4: Filtros de perfiles
- [ ] Test 5: Detalle de perfil
- [ ] Test 6: Agregar favorito
- [ ] Test 7: Eliminar favorito
- [ ] Test 8: Crear reseña
- [ ] Test 9: Ver reseñas
- [ ] Test 10: Enviar mensaje
- [ ] Test 11: Recibir mensajes
- [ ] Test 12: Persistencia de datos

---

## 🎯 Credenciales de Prueba

Después de ejecutar `npm run seed`, usa estas credenciales:

**Cliente:**
- Email: `client@test.com`
- Password: `password123`
- Role: client

**Proveedor (Valeria):**
- Email: `valeria@example.com`
- Password: `password123`
- Role: provider

**Otros Proveedores:**
- `camila@example.com` / `password123`
- `isabella@example.com` / `password123`
- `elena@example.com` / `password123`
- `sofia@example.com` / `password123`
- `gabriela@example.com` / `password123`

---

## 🐛 Debug Tips

**Ver logs del backend:**
- Watch terminal donde ejecutaste `npm run dev`

**Ver logs de MongoDB:**
```bash
tail -f /usr/local/var/log/mongodb/mongo.log
```

**Inspeccionar requests en navegador:**
1. F12 → Network tab
2. Filtrar por "Fetch/XHR"
3. Ver requests a `localhost:3001/api/*`

**Verificar datos en MongoDB:**
```bash
mongosh
use scorta

# Ver usuarios
db.users.find().pretty()

# Ver perfiles
db.profiles.find().pretty()

# Ver favoritos
db.favorites.find().pretty()

# Ver reseñas
db.reviews.find().pretty()

# Ver mensajes
db.messages.find().pretty()
```

---

## ✅ Test Completado

Si todos los tests pasan, la integración frontend-backend está **funcionando correctamente** y lista para deployment! 🎉
