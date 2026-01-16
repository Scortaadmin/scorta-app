#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      SCORTA - Guía Rápida de Testing                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 PASOS PARA PROBAR LA INTEGRACIÓN:"
echo ""

echo "1️⃣  Verificar que los servicios estén corriendo:"
echo "   cd backend && ./test-services.sh"
echo ""

echo "2️⃣  Abrir la aplicación:"
echo "   - Abre index.html con Live Server en VS Code"
echo "   - O abre directamente en el navegador"
echo ""

echo "3️⃣  Probar Registro:"
echo "   - Click en 'Crear Cuenta'"
echo "   - Email: test@scorta.com"
echo "   - Password: password123"
echo "   - Role: client"
echo "   - Click 'Registrar'"
echo ""

echo "4️⃣  Verificar en MongoDB:"
echo "   mongosh"
echo "   use scorta"
echo "   db.users.find().pretty()"
echo ""

echo "5️⃣  Probar Login:"
echo "   - Usa las mismas credenciales"
echo "   - Deberías ver el marketplace"
echo ""

echo "6️⃣  Verificar en DevTools:"
echo "   - Abre la pestaña Network"
echo "   - Deberías ver requests a http://localhost:3001/api/*"
echo ""

echo "✅ Si todo funciona, la integración está completa!"
echo ""
echo "📝 Para más detalles, revisa el walkthrough.md"
echo ""
