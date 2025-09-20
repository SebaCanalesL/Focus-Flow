
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Corrected import
import { Habit } from '@/lib/types';
import { format } from 'date-fns';


export async function createHabit(uid: string, data: Partial<Habit>) {
  const ref = doc(collection(db, `users/${uid}/habits`)); // Corrected instance
  return setDoc(
    ref,
    {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateHabit(uid: string, habitId: string, patch: Partial<Habit>) {
  const ref = doc(db, `users/${uid}/habits/${habitId}`); // Corrected instance
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export const getHabit = async (uid: string, habitId: string) => {
  const habitRef = doc(db, `users/${uid}/habits`, habitId); // Corrected instance
  const docSnap = await getDoc(habitRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Habit;
  } else {
    return null;
  }
};

export const deleteHabit = async (uid: string, habitId: string) => {
  const habitRef = doc(db, `users/${uid}/habits`, habitId); // Corrected instance
  return deleteDoc(habitRef);
};

export const toggleHabitCompletion = async (uid: string, habitId: string, date: Date, habits: Habit[]) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const completed = habit.completedDates.includes(dateString);
    const newCompletedDates = completed
      ? habit.completedDates.filter(d => d !== dateString)
      : [...habit.completedDates, dateString];
    
    const habitDocRef = doc(db, `users/${uid}/habits`, habitId); // Corrected instance
    await updateDoc(habitDocRef, { completedDates: newCompletedDates.sort() });
};
