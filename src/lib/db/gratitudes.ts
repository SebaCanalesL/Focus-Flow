
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Corrected import
import { GratitudeEntry } from '@/lib/types';

type GratitudeInput = Partial<Omit<GratitudeEntry, 'id' | 'createdAt' | 'updatedAt'>>;

export async function createGratitude(uid: string, data: GratitudeInput) {
  const ref = doc(collection(db, `users/${uid}/gratitudes`)); // Corrected instance
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

export async function updateGratitude(
  uid: string,
  gratitudeId: string,
  data: GratitudeInput
) {
  const gratitudeRef = doc(db, `users/${uid}/gratitudes`, gratitudeId); // Corrected instance

  const dataToSet = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(gratitudeRef, dataToSet);
}

export const getGratitude = async (uid: string, gratitudeId: string) => {
  const gratitudeRef = doc(db, `users/${uid}/gratitudes`, gratitudeId); // Corrected instance
  const docSnap = await getDoc(gratitudeRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as GratitudeEntry;
  }
  return null;
};

export const deleteGratitude = (uid: string, gratitudeId: string) => {
  const gratitudeRef = doc(db, `users/${uid}/gratitudes`, gratitudeId); // Corrected instance
  return deleteDoc(gratitudeRef);
};

export const listGratitudesByDate = async (uid: string, date: string) => {
  const gratitudesCol = collection(db, `users/${uid}/gratitudes`); // Corrected instance
  const q = query(gratitudesCol, where('date', '==', date));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as GratitudeEntry)
  );
};
