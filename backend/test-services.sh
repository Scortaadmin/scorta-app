#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SCORTA - Prueba de Integración Frontend-Backend       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "🔍 Verificando servicios..."
echo ""

# Verificar MongoDB
if pgrep mongod > /dev/null; then
    echo "✅ MongoDB está corriendo"
else
    echo "❌ MongoDB NO está corriendo"
    echo "   Ejecuta: nohup ~/Downloads/mongodb-macos-aarch64--8.2.3/bin/mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --bind_ip 127.0.0.1 > /dev/null 2>& 1 &"
    exit 1
fi

# Verificar Backend
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend está corriendo"
    echo ""
    curl -s http://localhost:3001/health | python3 -m json.tool 2>/dev/null || echo "Backend respondiendo"
else
    echo "❌ Backend NO está corriendo"
    echo "   Inicia con: cd backend && npm run dev"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ TODO ESTÁ LISTO                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Próximos pasos para probar:"
echo "   1. Abre index.html con Live Server"
echo "   2. Intenta registrar un nuevo usuario"
echo "   3. Verifica que el usuario se guarde en MongoDB:"
echo "      mongosh"
echo "      use scorta"
echo "      db.users.find().pretty()"
echo ""
echo "🌐 URLs importantes:"
echo "   Backend API: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo ""
