# 🚀 Guía de Configuración MongoDB Atlas para SCORTA

## Paso 1: Crear Cuenta (2 minutos)

**La página de registro ya está abierta en tu navegador.**

Opciones para registrarte:
- ✅ **Recomendado**: "Sign up with Google" (más rápido)
- Alternativamente: Usar email y crear contraseña

Después de registrarte, MongoDB te redirigirá al dashboard.

---

## Paso 2: Crear Cluster Gratuito (2 minutos)

1. Click en el botón verde **"Build a Database"** o **"Create"**
2. Selecciona **"M0 FREE"** (el plan gratuito de 512MB)
3. Configuración:
   - **Cloud Provider**: AWS (recomendado)
   - **Region**: Escoge `us-east-1` o la más cercana a Ecuador
   - **Cluster Name**: Puedes dejarlo como `Cluster0`
4. Click **"Create Deployment"** o **"Create Cluster"**

---

## Paso 3: Configurar Seguridad (2 minutos)

### 3.1 Crear Usuario de Base de Datos
Aparecerá un modal pidiendo crear un usuario:

- **Username**: `scortaadmin` (o el que prefieras)
- **Password**: Genera uno seguro o usa: `Scorta2026Secure!`
- ⚠️ **IMPORTANTE**: Guarda estos datos, los necesitarás luego

### 3.2 Configurar Network Access
- Te pedirá agregar una IP Address
- Click en **"Add My Current IP Address"**
- **IMPORTANTE**: También agrega `0.0.0.0/0` para permitir acceso desde cualquier lugar
  - Click "Add IP Address"
  - En el campo IP: `0.0.0.0/0`
  - Description: "Allow all"
  - Click "Confirm"

---

## Paso 4: Obtener Connection String (1 minuto)

1. Una vez creado el cluster, ve a la vista principal
2. Click en el botón **"Connect"** de tu cluster
3. Selecciona **"Drivers"**
4. En "Driver": Selecciona **Node.js** (versión 5.5 o superior)
5. Copia el **connection string**, se verá así:
   ```
   mongodb+srv://scortaadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **REEMPLAZA** `<password>` con la contraseña que creaste en el paso 3.1

7. **AGREGA** el nombre de la base de datos al final:
   ```
   mongodb+srv://scortaadmin:Scorta2026Secure!@cluster0.xxxxx.mongodb.net/scorta?retryWrites=true&w=majority
   ```

---

## Paso 5: Actualizar Backend (Yo lo haré por ti)

**Una vez que tengas el connection string completo, pégamelo aquí y yo:**

1. Actualizaré tu archivo `.env`
2. Reiniciaré el backend
3. Verificaré la conexión
4. Ejecutaré el script de seed para crear datos iniciales

---

## 🎯 Qué Necesito de Ti

**Pégame el connection string completo** (debe verse así):
```
mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/scorta?retryWrites=true&w=majority
```

Y yo me encargo del resto 🚀
