#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { seedDevelopmentData } from './seed-dev-data';

async function setupDevelopmentEnvironment() {
  console.log('🚀 Configurando ambiente de desarrollo...');
  
  try {
    // Esperar un poco para que los emuladores estén listos
    console.log('⏳ Esperando que los emuladores estén listos...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Cargar datos de desarrollo
    await seedDevelopmentData();
    
    console.log('\n✨ ¡Ambiente de desarrollo configurado exitosamente!');
    console.log('\n📋 Información de acceso:');
    console.log('   📧 Email: dev@focusflow.com');
    console.log('   🔑 Contraseña: devpassword123');
    console.log('   🌐 Aplicación: http://localhost:3000');
    console.log('   🔧 Emuladores UI: http://localhost:4000');
    
  } catch (error) {
    console.error('❌ Error configurando ambiente de desarrollo:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupDevelopmentEnvironment();
}

export { setupDevelopmentEnvironment };
