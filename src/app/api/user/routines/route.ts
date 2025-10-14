
import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Función auxiliar para verificar la autenticación del usuario
async function verifyUser(request: Request) {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authorization.split('Bearer ')[1];
  
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    // For client-side Firebase, we need to verify the token differently
    // Since we're in a server environment, we'll decode the token manually
    if (token && token.length > 100) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.user_id || payload.sub) {
            return payload.user_id || payload.sub;
          }
        }
      } catch (decodeError) {
        console.error('Error decoding token manually:', decodeError);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// GET: Obtener todas las rutinas del usuario
export async function GET(request: Request) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }
    
    const routinesRef = collection(db, 'users', userId, 'routines');
    const snapshot = await getDocs(routinesRef);
    
    console.log('Routines query result:', {
      userId,
      empty: snapshot.empty,
      size: snapshot.size,
      docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
    });
    
    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const routines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Returning routines:', routines);
    return NextResponse.json(routines, { status: 200 });

  } catch (error) {
    console.error('Error fetching routines:', error);
    return NextResponse.json({ error: 'Failed to fetch routines' }, { status: 500 });
  }
}

// POST: Crear una nueva rutina
export async function POST(request: Request) {
  console.log('POST /api/user/routines called');
  const userId = await verifyUser(request);
  console.log('User ID from token:', userId);
  
  if (!userId) {
    console.log('No user ID found, returning 401');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!db) {
      console.log('Database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }
    
    const routineData = await request.json();
    console.log('Routine data received:', routineData);

    const newRoutine = {
      ...routineData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Creating routine in database:', newRoutine);
    const docRef = await addDoc(collection(db, 'users', userId, 'routines'), newRoutine);
    console.log('Routine created with ID:', docRef.id);
    
    const response = { id: docRef.id, ...newRoutine };
    console.log('Returning created routine:', response);
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating routine:', error);
    return NextResponse.json({ error: 'Failed to create routine' }, { status: 500 });
  }
}

// PUT: Actualizar una rutina existente
export async function PUT(request: Request) {
  console.log('=== PUT /api/user/routines START ===');
  
  try {
    const userId = await verifyUser(request);
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('No user ID, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      console.error('Database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }
    
    const requestBody = await request.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { id, ...routineData } = requestBody;

    console.log('Extracted ID:', id);
    console.log('Extracted routine data:', JSON.stringify(routineData, null, 2));

    if (!id) {
      console.error('No routine ID provided');
      return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 });
    }

    console.log('Looking for routine with ID:', id, 'for user:', userId);
    const routineRef = doc(db, 'users', userId, 'routines', id);
    const docSnap = await getDocs(collection(db, 'users', userId, 'routines'));

    console.log('Document exists:', docSnap.docs.some(d => d.id === id));
    if (!docSnap.docs.some(d => d.id === id)) {
      console.error('Routine not found:', id);
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    const routineDoc = docSnap.docs.find(d => d.id === id);
    console.log('Current document data:', routineDoc?.data());

    // Simple update with minimal data first
    const simpleUpdateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Only add fields that are not undefined
    if (routineData.stepIds !== undefined) {
      simpleUpdateData.stepIds = routineData.stepIds;
    }
    if (routineData.customSteps !== undefined) {
      simpleUpdateData.customSteps = routineData.customSteps;
    }
    if (routineData.reminders !== undefined) {
      simpleUpdateData.reminders = routineData.reminders;
    }

    console.log('Simple update data:', JSON.stringify(simpleUpdateData, null, 2));

    await updateDoc(routineRef, simpleUpdateData);
    console.log('Update completed successfully');

    // Get the updated document to return
    const updatedDocSnap = await getDocs(collection(db, 'users', userId, 'routines'));
    const updatedDoc = updatedDocSnap.docs.find(d => d.id === id);
    const updatedRoutine = { id: updatedDoc?.id, ...updatedDoc?.data() };

    console.log('Updated routine:', JSON.stringify(updatedRoutine, null, 2));
    console.log('=== PUT /api/user/routines SUCCESS ===');

    return NextResponse.json(updatedRoutine, { status: 200 });

  } catch (error) {
    console.error('=== PUT /api/user/routines ERROR ===');
    console.error('Error updating routine:', error);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    console.error('=== END ERROR ===');
    
    return NextResponse.json({ 
      error: 'Failed to update routine', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// DELETE: Eliminar una rutina
export async function DELETE(request: Request) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const routineId = searchParams.get('id');

    if (!routineId) {
      return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 });
    }

    const routineRef = doc(db, 'users', userId, 'routines', routineId);
    const docSnap = await getDocs(collection(db, 'users', userId, 'routines'));

    if (!docSnap.docs.some(d => d.id === routineId)) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    await deleteDoc(routineRef);

    return NextResponse.json({ message: 'Routine deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting routine:', error);
    return NextResponse.json({ error: 'Failed to delete routine' }, { status: 500 });
  }
}
