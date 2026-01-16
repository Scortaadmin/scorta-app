#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SCORTA - Instalación Final de MongoDB                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Paso 1: Mover MongoDB
echo "📦 Paso 1: Moviendo MongoDB a /usr/local/mongodb..."
echo "   (Se te pedirá tu contraseña de administrador)"
echo ""

sudo mv ~/Downloads/mongodb-macos-aarch64--8.2.3 /usr/local/mongodb

if [ $? -ne 0 ]; then
    echo "❌ Error al mover archivos. Verificando si ya existe..."
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

# Paso 2: Agregar al PATH
echo "🔧 Paso 2: Configurando PATH..."
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

# Paso 3: Iniciar MongoDB
echo "🚀 Paso 3: Iniciando MongoDB..."
echo ""

# Crear archivo de log si no existe
touch /usr/local/var/log/mongodb/mongo.log 2>/dev/null

# Iniciar MongoDB en background
/usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork --bind_ip 127.0.0.1

if [ $? -eq 0 ]; then
    echo "✅ MongoDB se inició correctamente"
else
    echo "⚠️  Intentando iniciar sin fork..."
    # Si falla, intentar sin fork
    /usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --bind_ip 127.0.0.1 &
    sleep 2
fi

echo ""

# Paso 4: Verificar
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
echo "║                  ✅ MONGODB ESTÁ LISTO                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🔗 Connection String: mongodb://localhost:27017"
echo ""
echo "📝 Comandos útiles:"
echo "  Parar MongoDB:     pkill mongod"
echo "  Reiniciar MongoDB: pkill mongod && /usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb --fork"
echo "  Ver logs:          tail -f /usr/local/var/log/mongodb/mongo.log"
echo ""
echo "✅ Siguiente paso: En el directorio backend, ejecuta 'npm run dev'"
echo ""
