
import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

// Función auxiliar para verificar la autenticación del usuario
async function verifyUser(request: Request) {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  const token = authorization.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
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
    const routinesRef = db.collection('users').doc(userId).collection('routines');
    const snapshot = await routinesRef.get();
    
    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const routines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(routines, { status: 200 });

  } catch (error) {
    console.error('Error fetching routines:', error);
    return NextResponse.json({ error: 'Failed to fetch routines' }, { status: 500 });
  }
}

// POST: Crear una nueva rutina
export async function POST(request: Request) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const routineData = await request.json();

    const newRoutine = {
      ...routineData,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('users').doc(userId).collection('routines').add(newRoutine);
    
    return NextResponse.json({ id: docRef.id, ...newRoutine }, { status: 201 });

  } catch (error) {
    console.error('Error creating routine:', error);
    return NextResponse.json({ error: 'Failed to create routine' }, { status: 500 });
  }
}

// PUT: Actualizar una rutina existente
export async function PUT(request: Request) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ...routineData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 });
    }

    const routineRef = db.collection('users').doc(userId).collection('routines').doc(id);
    const doc = await routineRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    await routineRef.update({
      ...routineData,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Routine updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating routine:', error);
    return NextResponse.json({ error: 'Failed to update routine' }, { status: 500 });
  }
}
