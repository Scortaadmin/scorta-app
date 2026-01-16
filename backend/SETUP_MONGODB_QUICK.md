# MongoDB Setup - Opción Más Rápida

Ya tienes el backend corriendo ✅. Ahora vamos a conectar MongoDB para tener persistencia real.

## 🚀 Opción Recomendada: MongoDB Atlas (5 minutos)

**MongoDB Atlas es GRATIS y no requiere instalación local.**

### Pasos Rápidos:

1. **Crear cuenta**: https://www.mongodb.com/cloud/atlas/register
   - Regístrate con Google (más rápido)

2. **Crear Cluster**:
   - Click "Build a Database" → "M0 FREE"
   - Provider: AWS
   - Region: Cualquiera cercana
   - Click "Create"

3. **Configurar Seguridad**:
   - **Usuario**: Crea username y password (guárdalos)
   - **IP**: Agregar `0.0.0.0/0` (permite todas las conexiones)

4. **Obtener Connection String**:
   - Click "Connect" → "Drivers" → Copia el string
   - Se ve así: `mongodb+srv://usuario:password@cluster.mongodb.net/`

5. **Pégame el connection string aquí** y yo actualizo automáticamente tu backend

---

## 🛠️ Alternativa: MongoDB Local (15-20 minutos)

Si prefieres instalación local, necesitas ejecutar en Terminal:

```bash
# En una nueva ventana de Terminal:
cd ~/Downloads
tar -xzvf mongodb-macos-arm64-8.2.3.tgz
sudo mv mongodb-macos-aarch64--8.2.3 /usr/local/mongodb
sudo mkdir -p /usr/local/var/mongodb /usr/local/var/log/mongodb  
sudo chown -R $USER /usr/local/var/mongodb /usr/local/var/log/mongodb
/usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb --fork
```

---

**¿Cuál opción prefieres?** 
- **Atlas (recomendado)**: Dame el connection string cuando lo tengas
- **Local**: Ejecuta los comandos arriba y avísame cuando MongoDB esté corriendo
