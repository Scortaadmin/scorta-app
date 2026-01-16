# 🚀 Instalación Rápida de MongoDB

## Ejecuta este comando en tu Terminal:

```bash
cd /Users/dircreativobda/.gemini/antigravity/scratch/scorta-app/backend
./install-mongodb.sh
```

## ¿Qué hace este script?

1. ✅ Detecta si Homebrew está instalado
2. ✅ Instala Homebrew si es necesario (te pedirá tu contraseña)
3. ✅ Instala MongoDB Community Edition
4. ✅ Inicia el servicio de MongoDB automáticamente
5. ✅ Verifica que todo funcione correctamente

## Requisitos

- Necesitarás tu **contraseña de administrador** de macOS
- Conexión a internet
- Aproximadamente **2-5 minutos**

## Después de la Instalación

Una vez completado, MongoDB estará corriendo en:
```
mongodb://localhost:27017
```

El archivo `.env` ya está configurado con esta URL, así que solo necesitas ejecutar:
```bash
npm run dev
```

---

## Alternativa Manual

Si prefieres instalar manualmente, ejecuta estos comandos uno por uno:

```bash
# 1. Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Agregar MongoDB tap
brew tap mongodb/brew

# 3. Instalar MongoDB
brew install mongodb-community@7.0

# 4. Iniciar MongoDB
brew services start mongodb-community@7.0

# 5. Verificar
brew services list | grep mongodb
```
