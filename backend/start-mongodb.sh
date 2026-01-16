#!/bin/bash

echo "🔧 Corrigiendo permisos de MongoDB..."
echo ""

# Arreglar permisos
sudo chown -R $USER /usr/local/var/mongodb
sudo chown -R $USER /usr/local/var/log/mongodb

echo "✅ Permisos corregidos"
echo ""
echo "🚀 Iniciando MongoDB..."
echo ""

# Iniciar MongoDB
/usr/local/mongodb/bin/mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork --bind_ip 127.0.0.1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MongoDB está corriendo en mongodb://localhost:27017"
    echo ""
else
    echo ""
    echo "❌ Error al iniciar. Revisando logs..."
    echo ""
    tail -n 10 /usr/local/var/log/mongodb/mongo.log
fi
