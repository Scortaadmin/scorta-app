#!/bin/bash

# Script para actualizar MongoDB connection string en .env
# Uso: ./update-mongodb.sh "tu_connection_string_aqui"

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar el connection string como argumento"
    echo "Uso: ./update-mongodb.sh 'mongodb+srv://usuario:password@cluster.mongodb.net/scorta'"
    exit 1
fi

CONNECTION_STRING="$1"
ENV_FILE="backend/.env"

# Verificar que el .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo .env en backend/"
    exit 1
fi

# Backup del .env actual
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup creado"

# Actualizar MONGODB_URI
if grep -q "^MONGODB_URI=" "$ENV_FILE"; then
    # Reemplazar línea existente
    sed -i '' "s|^MONGODB_URI=.*|MONGODB_URI=$CONNECTION_STRING|" "$ENV_FILE"
    echo "✅ MONGODB_URI actualizado"
else
    # Agregar nueva línea
    echo "MONGODB_URI=$CONNECTION_STRING" >> "$ENV_FILE"
    echo "✅ MONGODB_URI agregado"
fi

# Comentar/remover SKIP_DB si existe
if grep -q "^SKIP_DB=" "$ENV_FILE"; then
    sed -i '' "s|^SKIP_DB=|# SKIP_DB=|" "$ENV_FILE"
    echo "✅ SKIP_DB deshabilitado"
fi

echo ""
echo "🎉 Configuración completada!"
echo "📝 Archivo actualizado: $ENV_FILE"
echo "💾 Backup guardado en: ${ENV_FILE}.backup.*"
echo ""
echo "🚀 Próximo paso: Reiniciar el backend"
echo "   cd backend && npm run dev"
