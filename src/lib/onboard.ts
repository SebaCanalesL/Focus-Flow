// src/lib/onboard.ts
import {
  doc, getDoc, setDoc, writeBatch,
  serverTimestamp, collection
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SEED_IDS = {
  agradecer: 'gratitude-habit',
  gastos: 'seed-gastos-semanal',
  leer: 'seed-leer-10-pag',
} as const;

type SeedState = 'pending' | 'done' | 'failed';

export async function ensureUserSeed(
  uid: string,
  profile?: { email?: string; displayName?: string; photoURL?: string }
) {
  const userRef = doc(db, `users/${uid}`);
  const now = serverTimestamp();

  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  if (userDoc.exists() && userData.seedState === 'done') {
    return;
  }

  await setDoc(userRef, {
    email: profile?.email ?? null,
    displayName: profile?.displayName ?? null,
    photoURL: profile?.photoURL ?? null,
    createdAt: userData?.createdAt ?? now, // Keep original creation date
    updatedAt: now,
    seeded: false,
    seedState: 'pending' as SeedState,
    version: 1,
  }, { merge: true });


  // 2) Sembrar hábitos con IDs fijos (merge para idempotencia)
  const habitsCol = collection(db, `users/${uid}/habits`);
  const batch = writeBatch(db);

  batch.set(doc(habitsCol, SEED_IDS.agradecer), {
    name: 'Agradecer',
    icon: '🙏',
    frequency: 'daily',
    order: 0,
    completedDates: [],
    reminderEnabled: false,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  batch.set(doc(habitsCol, SEED_IDS.gastos), {
    name: 'Revisión de gastos semanal',
    icon: '💸',
    frequency: 'weekly',
    daysPerWeek: 1,
    order: 1,
    completedDates: [],
    reminderEnabled: false,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  batch.set(doc(habitsCol, SEED_IDS.leer), {
    name: 'Leer 10 páginas',
    icon: '📚',
    frequency: 'daily',
    order: 2,
    completedDates: [],
    reminderEnabled: false,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  try {
    await batch.commit();
    await setDoc(userRef, { seeded: true, seedState: 'done', updatedAt: now }, { merge: true });
  } catch (e) {
    await setDoc(userRef, { seedState: 'failed', updatedAt: now }, { merge: true });
    throw e; // que la capa superior decida, pero no bloquees la UI.
  }
}
