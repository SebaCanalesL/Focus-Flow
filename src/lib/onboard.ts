// src/lib/onboard.ts
import {
  doc, getDoc, setDoc, writeBatch,
  serverTimestamp, collection
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { INITIAL_HABITS } from './data'; // Use single source of truth
import type { UserProfile } from './types';

type SeedState = 'pending' | 'done' | 'failed';

/**
 * Ensures a new user has the initial set of habits and a user profile document.
 * This function is idempotent: it will not run if the user already has seed data.
 */
export async function ensureUserSeed(uid: string, profile?: Omit<UserProfile, 'uid'>) {
  const userRef = doc(db, `users/${uid}`);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  const now = serverTimestamp();
  const userCreationTimestamp = userData?.createdAt ?? now;

  // 1. If seeding is already done, do nothing.
  if (userDoc.exists() && userData.seedState === 'done') {
    return;
  }

  // 2. Mark the user's seedState as 'pending' and create/update their profile.
  await setDoc(userRef, {
    email: profile?.email ?? null,
    displayName: profile?.displayName ?? null,
    photoURL: profile?.photoURL ?? null,
    createdAt: userCreationTimestamp, // Persist original creation date if it exists
    updatedAt: now,
    seedState: 'pending' as SeedState,
  }, { merge: true });

  // 3. Create initial habits in a single atomic batch operation.
  const habitsCol = collection(db, `users/${uid}/habits`);
  const batch = writeBatch(db);

  // Special handling for the gratitude habit
  const gratitudeHabit = INITIAL_HABITS.find(h => h.id === 'gratitude');
  if (gratitudeHabit) {
    const { id, ...habitData } = gratitudeHabit;
    const habitRef = doc(habitsCol, id);
    batch.set(habitRef, {
      ...habitData,
      createdAt: userCreationTimestamp, // Use user creation time
      updatedAt: now,
    });
  }

  // Add other initial habits as before
  INITIAL_HABITS.forEach(habit => {
    if (habit.id === 'gratitude') return; // Already handled
    const { id, ...habitData } = habit;
    const habitRef = doc(habitsCol, id);
    batch.set(habitRef, {
      ...habitData,
      createdAt: now,
      updatedAt: now, // Add updatedAt timestamp
    });
  });

  // 4. Commit the batch and update the seedState upon completion or failure.
  try {
    await batch.commit();
    await setDoc(userRef, { seedState: 'done', updatedAt: now }, { merge: true });
  } catch (error) {
    console.error("Error seeding user data:", error);
    await setDoc(userRef, { seedState: 'failed', updatedAt: now }, { merge: true });
    // Optionally re-throw or handle the error in the UI
  }
}
