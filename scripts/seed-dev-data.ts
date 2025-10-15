#!/usr/bin/env tsx

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { DEV_USER, SEED_DATA } from '../src/lib/seed-data';

// Configuración de Firebase para emuladores
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

async function seedDevelopmentData() {
  console.log('🌱 Iniciando carga de datos de desarrollo...');

  try {
    // Inicializar Firebase
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    // Conectar a emuladores
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, 'http://localhost:9098');
    }
    
    // Conectar a Firestore emulator (verificar si ya está conectado)
    try {
      connectFirestoreEmulator(firestore, 'localhost', 8081);
    } catch (error) {
      // Ya está conectado, continuar
      console.log('ℹ️  Firestore emulator ya conectado');
    }

    console.log('📡 Conectado a emuladores de Firebase');

    // Crear usuario de desarrollo
    console.log('👤 Creando usuario de desarrollo...');
    
    try {
      // Intentar crear el usuario
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        DEV_USER.email, 
        'devpassword123'
      );
      
      console.log('✅ Usuario de desarrollo creado:', userCredential.user.email);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️  Usuario ya existe, iniciando sesión...');
        await signInWithEmailAndPassword(auth, DEV_USER.email, 'devpassword123');
        console.log('✅ Sesión iniciada con usuario existente');
      } else {
        throw error;
      }
    }

    // Cargar datos en Firestore
    console.log('📊 Cargando datos en Firestore...');
    
    const userData = SEED_DATA[DEV_USER.uid];
    if (!userData) {
      throw new Error('No se encontraron datos de ejemplo para el usuario');
    }

    const batch = writeBatch(firestore);

    // Cargar hábitos
    console.log('📝 Cargando hábitos...');
    const habitsRef = collection(firestore, 'users', DEV_USER.uid, 'habits');
    userData.habits.forEach(habit => {
      const habitRef = doc(habitsRef, habit.id);
      batch.set(habitRef, habit);
    });

    // Cargar entradas de gratitud
    console.log('🙏 Cargando entradas de gratitud...');
    const gratitudeRef = collection(firestore, 'users', DEV_USER.uid, 'gratitude');
    userData.gratitudeEntries.forEach(entry => {
      const entryRef = doc(gratitudeRef, entry.id);
      batch.set(entryRef, entry);
    });

    // Cargar rutinas
    console.log('🔄 Cargando rutinas...');
    const routinesRef = collection(firestore, 'users', DEV_USER.uid, 'routines');
    userData.routines.forEach(routine => {
      const routineRef = doc(routinesRef, routine.id);
      batch.set(routineRef, routine);
    });

    // Ejecutar batch
    await batch.commit();
    
    console.log('✅ Datos cargados exitosamente!');
    console.log(`📊 ${userData.habits.length} hábitos cargados`);
    console.log(`🙏 ${userData.gratitudeEntries.length} entradas de gratitud cargadas`);
    console.log(`🔄 ${userData.routines.length} rutinas cargadas`);
    
    console.log('\n🎉 ¡Datos de desarrollo listos!');
    console.log('📧 Email: dev@focusflow.com');
    console.log('🔑 Contraseña: devpassword123');
    console.log('🌐 App: http://localhost:3000');
    console.log('🔧 Emuladores: http://localhost:4000');

  } catch (error) {
    console.error('❌ Error cargando datos de desarrollo:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedDevelopmentData();
}

export { seedDevelopmentData };
