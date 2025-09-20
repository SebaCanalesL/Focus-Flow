
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Corrected import


export async function createUser(uid: string, data: any) {
  const userRef = doc(db, 'users', uid); // Corrected instance
  return setDoc(
    userRef,
    {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateUser(uid: string, data: any) {
  const userRef = doc(db, 'users', uid); // Corrected instance
  return updateDoc(
    userRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    }
  );
}

export const getUser = async (uid: string) => {
  const userRef = doc(db, 'users', uid); // Corrected instance
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as DocumentData;
  } else {
    return null;
  }
};

export const deleteUser = (uid: string) => {
  const userRef = doc(db, 'users', uid); // Corrected instance
  return deleteDoc(userRef);
};
