#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     SCORTA Backend - MongoDB Local Installation Script         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Homebrew no está instalado. Instalando Homebrew..."
    echo ""
    echo "Se te pedirá tu contraseña de administrador."
    echo ""
    
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [ -f "/opt/homebrew/bin/brew" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    echo ""
    echo "✅ Homebrew instalado correctamente"
    echo ""
else
    echo "✅ Homebrew ya está instalado"
    echo ""
fi

# Install MongoDB
echo "📦 Instalando MongoDB Community Edition..."
echo ""

brew tap mongodb/brew
brew install mongodb-community@7.0

echo ""
echo "✅ MongoDB instalado correctamente"
echo ""

# Start MongoDB service
echo "🚀 Iniciando servicio de MongoDB..."
echo ""

brew services start mongodb-community@7.0

echo ""
echo "✅ MongoDB está corriendo"
echo ""

# Verify installation
echo "🔍 Verificando instalación..."
echo ""

sleep 2

if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB está activo y funcionando"
    echo ""
    mongod --version | head -n 1
else
    echo "⚠️  MongoDB instalado pero no está corriendo"
    echo "   Intenta: brew services start mongodb-community@7.0"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ INSTALACIÓN COMPLETA                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "MongoDB está instalado y corriendo en: mongodb://localhost:27017"
echo ""
echo "Siguiente paso: Ejecuta 'npm run dev' en el directorio backend"
echo ""
