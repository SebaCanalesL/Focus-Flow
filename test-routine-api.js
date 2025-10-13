// Script de prueba para verificar la API de rutinas
import fetch from 'node-fetch';

async function testRoutineAPI() {
  console.log('🧪 Probando la API de rutinas...');
  
  // Datos de prueba para una rutina
  const testRoutine = {
    title: "Rutina de Prueba",
    category: "Partir el día",
    imageUrl: "/routines/routine-morning-energized.png",
    stepIds: ["step1", "step2", "step3"],
    frequency: "recurring",
    days: ["L", "M", "X", "J", "V"]
  };

  try {
    // Simular un token de autenticación (en un entorno real, esto vendría del cliente)
    const mockToken = "test-token";
    
    console.log('📤 Enviando rutina de prueba...');
    console.log('Datos:', JSON.stringify(testRoutine, null, 2));
    
    const response = await fetch('http://localhost:3000/api/user/routines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
      body: JSON.stringify(testRoutine),
    });

    console.log('📥 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Body:', responseText);
    
    if (response.ok) {
      console.log('✅ ¡Rutina guardada exitosamente!');
    } else {
      console.log('❌ Error al guardar la rutina');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testRoutineAPI();
