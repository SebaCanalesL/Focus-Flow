#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface DevOptions {
  quick?: boolean;
  clean?: boolean;
  seed?: boolean;
  test?: boolean;
  deploy?: 'staging' | 'prod';
  help?: boolean;
}

function showHelp() {
  console.log(`
🚀 Focus Flow - Dev Helper

Uso: npm run dev:helper [opciones]

Opciones:
  --quick, -q     Inicio rápido completo (emuladores + app + datos)
  --clean, -c     Limpiar y resetear ambiente
  --seed, -s      Solo cargar datos de desarrollo
  --test, -t      Ejecutar tests
  --deploy        Deploy a staging o prod
  --help, -h      Mostrar esta ayuda

Ejemplos:
  npm run dev:helper --quick
  npm run dev:helper --clean
  npm run dev:helper --test
  npm run dev:helper --deploy staging
  npm run dev:helper --deploy prod

Comandos directos recomendados:
  npm run dev:all      # Solo emuladores
  npm run dev:quick    # Todo en uno (experimental)
  npm run emu:reset    # Limpiar y recargar datos
`);
}

function checkEnvironment() {
  console.log('🔍 Verificando ambiente...');
  
  const checks = [
    { name: 'Node.js', command: 'node --version' },
    { name: 'npm', command: 'npm --version' },
    { name: 'Firebase CLI', command: 'firebase --version' },
    { name: 'TypeScript', command: 'tsc --version' }
  ];

  checks.forEach(check => {
    try {
      const version = execSync(check.command, { encoding: 'utf8' }).trim();
      console.log(`✅ ${check.name}: ${version}`);
    } catch (error) {
      console.log(`❌ ${check.name}: No encontrado`);
    }
  });

  // Verificar archivos importantes
  const importantFiles = [
    'package.json',
    'firebase.json',
    'apphosting.yaml',
    '.env.local'
  ];

  console.log('\n📁 Verificando archivos...');
  importantFiles.forEach(file => {
    if (existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`⚠️  ${file} (opcional)`);
    }
  });
}

function quickStart() {
  console.log('🚀 Iniciando ambiente completo...');
  
  try {
    console.log('1️⃣ Limpiando puertos...');
    execSync('npm run emu:pre', { stdio: 'inherit' });
    
    console.log('2️⃣ Iniciando emuladores...');
    execSync('firebase emulators:start --only hosting,firestore,auth,storage --import ./.emulator-data --export-on-exit', 
      { stdio: 'inherit' });
    
    console.log('3️⃣ Esperando que emuladores estén listos...');
    setTimeout(() => {
      console.log('4️⃣ Iniciando Next.js...');
      execSync('npm run dev', { stdio: 'inherit' });
      
      setTimeout(() => {
        console.log('5️⃣ Cargando datos de desarrollo...');
        execSync('npm run dev:setup', { stdio: 'inherit' });
        
        console.log('\n🎉 ¡Ambiente listo!');
        console.log('📱 App: http://localhost:3000');
        console.log('🔧 Emuladores: http://localhost:4000');
        console.log('👤 Usuario: dev@focusflow.com / devpassword123');
      }, 5000);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Error en inicio rápido:', error);
  }
}

function cleanEnvironment() {
  console.log('🧹 Limpiando ambiente...');
  
  try {
    execSync('npm run emu:stop', { stdio: 'inherit' });
    execSync('npm run emu:clean', { stdio: 'inherit' });
    execSync('npm run emu:pre', { stdio: 'inherit' });
    
    console.log('✅ Ambiente limpiado');
    console.log('💡 Ejecuta "npm run dev:all" para reiniciar');
  } catch (error) {
    console.error('❌ Error limpiando ambiente:', error);
  }
}

function runTests() {
  console.log('🧪 Ejecutando tests...');
  
  try {
    console.log('1️⃣ Verificando tipos...');
    execSync('npm run typecheck', { stdio: 'inherit' });
    
    console.log('2️⃣ Verificando linting...');
    execSync('npm run lint', { stdio: 'inherit' });
    
    console.log('3️⃣ Ejecutando tests E2E...');
    execSync('npm run test', { stdio: 'inherit' });
    
    console.log('✅ Todos los tests pasaron');
  } catch (error) {
    console.error('❌ Tests fallaron:', error);
    process.exit(1);
  }
}

function deploy(target: 'staging' | 'prod') {
  console.log(`🚀 Deploying a ${target}...`);
  
  try {
    if (target === 'staging') {
      console.log('📤 Pusheando a staging...');
      execSync('git push origin staging', { stdio: 'inherit' });
      console.log('✅ Deploy a staging iniciado');
      console.log('🌐 Monitorea en Firebase Console');
    } else {
      console.log('📤 Deploying a producción...');
      execSync('git checkout main', { stdio: 'inherit' });
      execSync('git merge staging', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Deploy a producción completado');
    }
  } catch (error) {
    console.error(`❌ Error en deploy a ${target}:`, error);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const options: DevOptions = {};

  // Parse arguments
  args.forEach(arg => {
    switch (arg) {
      case '--quick':
      case '-q':
        options.quick = true;
        break;
      case '--clean':
      case '-c':
        options.clean = true;
        break;
      case '--seed':
      case '-s':
        options.seed = true;
        break;
      case '--test':
      case '-t':
        options.test = true;
        break;
      case '--deploy':
        const deployIndex = args.indexOf('--deploy');
        if (deployIndex + 1 < args.length) {
          const target = args[deployIndex + 1] as 'staging' | 'prod';
          if (target === 'staging' || target === 'prod') {
            options.deploy = target;
          }
        }
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  });

  // Execute based on options
  if (options.help) {
    showHelp();
  } else if (options.quick) {
    quickStart();
  } else if (options.clean) {
    cleanEnvironment();
  } else if (options.seed) {
    execSync('npm run dev:setup', { stdio: 'inherit' });
  } else if (options.test) {
    runTests();
  } else if (options.deploy) {
    deploy(options.deploy);
  } else {
    // Default: show environment check
    checkEnvironment();
    console.log('\n💡 Usa --help para ver todas las opciones');
  }
}

if (require.main === module) {
  main();
}

export { main, showHelp, checkEnvironment, quickStart, cleanEnvironment, runTests, deploy };
