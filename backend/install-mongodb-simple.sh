#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SCORTA - Instalación de MongoDB Local                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Paso 1: Crear directorios necesarios
echo "📁 Paso 1: Creando directorios para MongoDB..."
echo "   (Se te pedirá tu contraseña de administrador)"
echo ""

sudo mkdir -p /usr/local/var/mongodb
sudo mkdir -p /usr/local/var/log/mongodb
sudo chown -R $(whoami) /usr/local/var/mongodb
sudo chown -R $(whoami) /usr/local/var/log/mongodb

if [ $? -ne 0 ]; then
    echo "❌ Error al crear directorios"
    exit 1
fi

echo "✅ Directorios creados correctamente"
echo ""

# Paso 2: Mover MongoDB
echo "📦 Paso 2: Moviendo MongoDB a /usr/local/mongodb..."
echo ""

sudo mv ~/Downloads/mongodb-macos-aarch64--8.2.3 /usr/local/mongodb

if [ $? -ne 0 ]; then
    echo "⚠️  Verificando si ya existe..."
    if [ -d "/usr/local/mongodb" ]; then
        echo "✅ MongoDB ya está en /usr/local/mongodb"
    else
        echo "❌ Error: No se pudo mover MongoDB"
        exit 1
    fi
else
    echo "✅ MongoDB movido correctamente"
fi

echo ""

# Paso 3: Configurar permisos
echo "🔐 Paso 3: Configurando permisos..."
sudo chown -R $(whoami) /usr/local/mongodb

echo "✅ Permisos configurados"
echo ""

# Paso 4: Agregar al PATH
echo "🔧 Paso 4: Configurando PATH..."
echo ""

if ! grep -q "/usr/local/mongodb/bin" ~/.zshrc 2>/dev/null; then
    echo 'export PATH="/usr/local/mongodb/bin:$PATH"' >> ~/.zshrc
    echo "✅ PATH agregado a ~/.zshrc"
else
    echo "✅ PATH ya configurado"
fi

# Aplicar para esta sesión
export PATH="/usr/local/mongodb/bin:$PATH"

echo ""

# Paso 5: Iniciar MongoDB
echo "🚀 Paso 5: Iniciando MongoDB..."
echo ""

# Intentar iniciar MongoDB
/usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork --bind_ip 127.0.0.1

if [ $? -eq 0 ]; then
    echo "✅ MongoDB se inició correctamente"
else
    echo "⚠️  Intentando iniciar de forma alternativa..."
    nohup /usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --bind_ip 127.0.0.1 > /dev/null 2>&1 &
    sleep 3
fi

echo ""

# Paso 6: Verificar
echo "🔍 Verificando instalación..."
echo ""

sleep 2

if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB está CORRIENDO"
    echo ""
    /usr/local/mongodb/bin/mongod --version | head -n 1
    echo ""
else
    echo "❌ MongoDB no está corriendo"
    echo ""
    echo "Intenta manualmente:"
    echo "  /usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ MONGODB INSTALADO Y CORRIENDO              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🔗 Connection String: mongodb://localhost:27017"
echo ""
echo "📝 Comandos útiles:"
echo "  Parar MongoDB:     pkill mongod"
echo "  Ver logs:          tail -f /usr/local/var/log/mongodb/mongo.log"
echo "  Verificar status:  pgrep mongod"
echo ""
echo "✅ Siguiente paso: Actualiza el archivo .env si es necesario"
echo ""
