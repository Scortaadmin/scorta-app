# SCORTA - Plan de Trabajo para Mañana (14 Enero 2026)

## 🎯 Objetivo
Completar integración frontend-backend, configurar MongoDB, testing y deployment (4-6 horas)

---

## ⏰ Timeline Estimado

| Fase | Tiempo | Descripción |
|------|--------|-------------|
| 1. MongoDB Setup | 20 min | Configurar base de datos |
| 2. Frontend Integration | 2 horas | Conectar frontend con backend |
| 3. Testing | 1 hora | Probar todas las funcionalidades |
| 4. Deployment | 1-2 horas | Publicar en producción |

---

## 📋 Checklist Detallado

### Fase 1: MongoDB Setup (20 min) ⚡

**Opción A: MongoDB Atlas (Recomendado)**
- [ ] Ir a https://www.mongodb.com/cloud/atlas/register
- [ ] Crear cuenta gratuita
- [ ] Crear cluster M0 (gratis)
- [ ] Configurar usuario y password
- [ ] Permitir acceso desde todas las IPs (0.0.0.0/0)
- [ ] Obtener connection string
- [ ] Actualizar `.env`:
  ```env
  MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/scorta
  # SKIP_DB=true  <- comentar esta línea
  ```
- [ ] Reiniciar backend: `npm run dev`
- [ ] Verificar conexión exitosa en logs

**Opción B: MongoDB Local**
- [ ] Ya tienes el archivo descargado en `~/Downloads`
- [ ] Ejecutar script de instalación
- [ ] Verificar que MongoDB esté corriendo

---

### Fase 2: Frontend-Backend Integration (2 horas) 🔗

#### 2.1 Actualizar Authentication (30 min)

**Archivo: `index.html`**
- [ ] Cambiar `<script src="auth.js"></script>` por `<script src="auth-backend.js"></script>`

**Archivos a actualizar:**

**`app.js` - Función `handleLogin`:**
```javascript
// Antes
const result = AuthModule.loginUser(email, password, rememberMe);

// Después
const result = await AuthModule.loginUser(email, password, rememberMe);
```

**`app.js` - Función `handleRegister`:**
```javascript
// Antes
const result = AuthModule.registerUser({...});

// Después
const result = await AuthModule.registerUser({...});
```

#### 2.2 Actualizar Perfiles (30 min)

**`app.js` - Función `renderMarketplace`:**
```javascript
// Antes
const profiles = getProfiles();

// Después
async function renderMarketplace() {
    const response = await API.getProfiles(currentFilters);
    const profiles = response.data.profiles || [];
    // ... resto del código
}
```

#### 2.3 Actualizar Favoritos (20 min)

**`app.js` - Función `toggleFavorite`:**
```javascript
// Antes
toggleFavoriteLocal(profileId);

// Después
async function toggleFavorite(profileId) {
    const favorites = getFavorites();
    if (favorites.includes(profileId)) {
        await API.removeFavorite(profileId);
    } else {
        await API.addFavorite(profileId);
    }
    // Actualizar UI
    await renderFavorites();
}
```

#### 2.4 Actualizar Reviews (20 min)

**`app.js` - Función `submitReview`:**
```javascript
// Antes
saveReviewLocal(reviewData);

// Después
async function submitReview(profileId, rating, text) {
    const response = await API.createReview(profileId, {
        rating,
        text
    });
    
    if (response.success) {
        showToast('Reseña publicada');
        await loadReviews(profileId);
    }
}
```

#### 2.5 Actualizar Messaging (20 min)

**`app.js` - Función `sendMessage`:**
```javascript
// Antes
saveMessageLocal(message);

// Después
async function sendMessage(recipientId, text) {
    const response = await API.sendMessage(recipientId, text);
    if (response.success) {
        await loadMessages(recipientId);
    }
}
```

---

### Fase 3: Testing (1 hora) 🧪

#### 3.1 Tests Manuales (30 min)

**Flujo de Usuario Completo:**
- [ ] Abrir `http://localhost:3001/health` - Verificar backend corriendo
- [ ] Abrir frontend con Live Server
- [ ] **Test 1: Registro**
  - [ ] Crear cuenta nueva
  - [ ] Verificar que se guarde en BD
  - [ ] Verificar token en localStorage
- [ ] **Test 2: Login**
  - [ ] Cerrar sesión
  - [ ] Iniciar sesión con cuenta creada
  - [ ] Verificar que cargue perfil
- [ ] **Test 3: Perfiles**
  - [ ] Ver marketplace
  - [ ] Verificar que carguen desde API
  - [ ] Aplicar filtros
  - [ ] Verificar búsqueda
- [ ] **Test 4: Favoritos**
  - [ ] Agregar a favoritos
  - [ ] Ver página de favoritos
  - [ ] Quitar de favoritos
- [ ] **Test 5: Reviews**
  - [ ] Entrar a un perfil
  - [ ] Dejar una reseña
  - [ ] Verificar que aparezca
- [ ] **Test 6: Messaging**
  - [ ] Enviar mensaje
  - [ ] Verificar que llegue
  - [ ] Ver conversaciones

#### 3.2 Tests Automatizados (30 min)

**Crear archivo `backend/tests/api.test.js`:**
```javascript
const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
    test('Register user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@test.com',
                password: 'password123',
                role: 'client'
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
    
    // ... más tests
});
```

**Ejecutar:**
```bash
npm test
```

---

### Fase 4: Deployment (1-2 horas) 🚀

#### 4.1 Preparar para Deploy (20 min)

**Archivo `backend/package.json` - Agregar:**
```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  }
}
```

#### 4.2 Deploy Backend en Render.com (30 min)

- [ ] Ir a https://render.com/
- [ ] Crear cuenta gratuita
- [ ] Click "New +" → "Web Service"
- [ ] Conectar repositorio Git (o subir código)
- [ ] Configurar:
  - **Name**: scorta-backend
  - **Environment**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
- [ ] Agregar variables de entorno:
  ```
  NODE_ENV=production
  PORT=10000
  MONGODB_URI=<tu_mongodb_atlas_uri>
  JWT_SECRET=<genera_secreto_seguro>
  JWT_REFRESH_SECRET=<genera_otro_secreto>
  CORS_ORIGIN=*
  ```
- [ ] Click "Create Web Service"
- [ ] Esperar deploy (5-10 min)
- [ ] Copiar URL del backend: `https://scorta-backend.onrender.com`

#### 4.3 Deploy Frontend (30 min)

**Opción A: Vercel**
- [ ] Ir a https://vercel.com/
- [ ] Subir carpeta del frontend
- [ ] Deploy automático

**Opción B: Netlify**
- [ ] Ir a https://netlify.com/
- [ ] Arrastrar carpeta del frontend
- [ ] Deploy instantáneo

#### 4.4 Conectar Frontend con Backend en Producción (10 min)

**Archivo `api-service.js` - Actualizar:**
```javascript
constructor() {
    // Detectar si estamos en producción
    const isProduction = window.location.hostname !== 'localhost';
    this.baseURL = isProduction 
        ? 'https://scorta-backend.onrender.com/api'
        : 'http://localhost:3001/api';
    //...
}
```

**Re-deploy frontend con cambio**

#### 4.5 Verificación Final (10 min)

- [ ] Probar registro en producción
- [ ] Probar login en producción
- [ ] Probar carga de perfiles
- [ ] Verificar que todo funcione end-to-end

---

## 🎁 Resultado Final

Al terminar mañana tendrás:

✅ Backend completo en producción con MongoDB  
✅ Frontend conectado a backend real  
✅ Sistema de autenticación funcionando  
✅ Perfiles, favoritos, reviews funcionando  
✅ Messaging operativo  
✅ App accessible desde cualquier dispositivo  

---

## 📞 Puntos de Partida Mañana

**Comandos iniciales:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Ver logs en tiempo real
cd backend
tail -f /usr/local/var/log/mongodb/mongo.log  # si usas MongoDB local
```

**Archivos a tener abiertos:**
- `api-service.js` (referencia)
- `auth-backend.js` (referencia)
- `app.js` (editar)
- `implementation_plan.md` (guía)

**URLs importantes:**
- Backend local: http://localhost:3001
- Backend health: http://localhost:3001/health
- Frontend: abrir index.html con Live Server

---

¡Nos vemos mañana! 🚀
