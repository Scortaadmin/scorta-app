#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SCORTA - Configuración MongoDB Manual                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Detectar carpeta de MongoDB descargada
echo "🔍 Buscando carpeta de MongoDB descargada..."
echo ""

# Buscar en Descargas
MONGODB_DIR=$(find ~/Downloads -maxdepth 1 -name "mongodb-macos-*" -type d 2>/dev/null | head -n 1)

if [ -z "$MONGODB_DIR" ]; then
    echo "⚠️  No se encontró la carpeta de MongoDB en ~/Downloads"
    echo ""
    echo "Por favor, especifica la ruta completa donde descomprimiste MongoDB:"
    read -p "Ruta: " MONGODB_DIR
fi

if [ ! -d "$MONGODB_DIR" ]; then
    echo "❌ La carpeta no existe: $MONGODB_DIR"
    exit 1
fi

echo "✅ Encontrado: $MONGODB_DIR"
echo ""

# Paso 1: Mover archivos
echo "📦 Paso 1: Moviendo archivos a /usr/local/mongodb..."
echo "   (Se te pedirá tu contraseña de administrador)"
echo ""

sudo mv "$MONGODB_DIR" /usr/local/mongodb

if [ $? -eq 0 ]; then
    echo "✅ Archivos movidos correctamente"
else
    echo "❌ Error al mover archivos"
    exit 1
fi

echo ""

# Paso 2: Crear directorios de datos
echo "📁 Paso 2: Creando directorios de datos..."
echo ""

sudo mkdir -p /usr/local/var/mongodb
sudo mkdir -p /usr/local/var/log/mongodb

# Dar permisos al usuario actual
sudo chown -R $(whoami) /usr/local/var/mongodb
sudo chown -R $(whoami) /usr/local/var/log/mongodb

echo "✅ Directorios creados correctamente"
echo ""

# Paso 3: Agregar MongoDB al PATH
echo "🔧 Paso 3: Configurando PATH..."
echo ""

# Agregar a .zshrc si no existe
if ! grep -q "/usr/local/mongodb/bin" ~/.zshrc 2>/dev/null; then
    echo 'export PATH="/usr/local/mongodb/bin:$PATH"' >> ~/.zshrc
    echo "✅ PATH actualizado en ~/.zshrc"
fi

# Aplicar para la sesión actual
export PATH="/usr/local/mongodb/bin:$PATH"

echo ""

# Paso 4: Iniciar MongoDB
echo "🚀 Paso 4: Iniciando MongoDB..."
echo ""

# Crear script de inicio
cat > /usr/local/var/start-mongodb.sh << 'EOF'
#!/bin/bash
/usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
EOF

chmod +x /usr/local/var/start-mongodb.sh

# Iniciar MongoDB
/usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork

if [ $? -eq 0 ]; then
    echo "✅ MongoDB iniciado correctamente"
else
    echo "❌ Error al iniciar MongoDB"
    exit 1
fi

echo ""

# Verificar
sleep 2
echo "🔍 Verificando instalación..."
echo ""

if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB está corriendo correctamente"
    /usr/local/mongodb/bin/mongod --version | head -n 1
else
    echo "⚠️  MongoDB no está corriendo"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ CONFIGURACIÓN COMPLETA                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "MongoDB está corriendo en: mongodb://localhost:27017"
echo ""
echo "Comandos útiles:"
echo "  Iniciar:  /usr/local/var/start-mongodb.sh"
echo "  Parar:    pkill mongod"
echo "  Estado:   pgrep -x mongod && echo 'Corriendo' || echo 'Detenido'"
echo ""
echo "Siguiente paso: cd backend && npm run dev"
echo ""
