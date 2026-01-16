#!/bin/bash

echo "🔧 Actualizando archivo .env..."

# Verificar si .env existe
if [ ! -f .env ]; then
    echo "📝 Creando .env desde .env.example..."
    cp .env.example .env
fi

# Comentar o remover SKIP_DB si existe
if grep -q "SKIP_DB=true" .env; then
    echo "✏️  Deshabilitando SKIP_DB..."
    sed -i '' 's/SKIP_DB=true/#SKIP_DB=true/' .env
fi

# Verificar que MONGODB_URI esté configurado
if ! grep -q "MONGODB_URI=mongodb://localhost:27017" .env; then
    echo "📝 Configurando MONGODB_URI..."
    echo "" >> .env
    echo "# MongoDB Connection" >> .env
    echo "MONGODB_URI=mongodb://localhost:27017/scorta" >> .env
fi

echo ""
echo "✅ Archivo .env actualizado"
echo ""
echo "Configuración de MongoDB:"
grep "MONGODB_URI" .env | grep -v "^#"
echo ""
