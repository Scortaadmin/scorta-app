#!/usr/bin/env node

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   SCORTA Backend - Setup Check                 ║
╚════════════════════════════════════════════════════════════════╝

Verificando configuración...
`);

const fs = require('fs');
const path = require('path');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ Archivo .env no encontrado');
    console.log('   Copia .env.example a .env y configúralo');
    process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Check MongoDB URI
if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI no configurado en .env');
    console.log('\n📋 Opciones de base de datos:\n');
    console.log('Opción 1: MongoDB Atlas (Cloud - Recomendado)');
    console.log('   1. Visita: https://www.mongodb.com/cloud/atlas');
    console.log('   2. Crea una cuenta gratuita');
    console.log('   3. Crea un cluster');
    console.log('   4. Obtén el connection string');
    console.log('   5. Actualiza MONGODB_URI en .env\n');
    console.log('Opción 2: MongoDB Local');
    console.log('   Instala MongoDB: brew install mongodb-community');
    console.log('   Inicia servicio: brew services start mongodb-community');
    console.log('   URI: mongodb://localhost:27017/scorta\n');
    process.exit(1);
}

// Check JWT Secret
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('dev')) {
    console.log('⚠️  JWT_SECRET usa valor por defecto');
    console.log('   Cambia JWT_SECRET en .env por un valor seguro en producción\n');
}

console.log('✅ Configuración válida');
console.log(`
Configuración actual:
  - Puerto: ${process.env.PORT || 5000}
  - Base de datos: ${process.env.MONGODB_URI.includes('localhost') ? 'MongoDB Local' : 'MongoDB Atlas'}
  - Entorno: ${process.env.NODE_ENV || 'development'}

Iniciando servidor...
`);

// Start the server
require('./server');
