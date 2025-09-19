
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { firestore } from '../firebase';

/**
 * Crea o actualiza un documento de usuario en Firestore.
 * Si el documento existe, mezcla los nuevos datos. Agrega un campo `updatedAt`.
 *
 * @param uid - El ID del usuario.
 * @param data - Los datos a guardar en el documento del usuario.
 * @returns Una promesa que se resuelve cuando la escritura se completa.
 */
export const upsertUser = (uid: string, data: any) => {
  const userRef = doc(firestore, 'users', uid);
  return setDoc(
    userRef,
    {
      ...data,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

/**
 * Obtiene un documento de usuario por su ID.
 *
 * @param uid - El ID del usuario.
 * @returns Una promesa que se resuelve con los datos del usuario o null si no existe.
 */
export const getUser = async (uid: string) => {
  const userRef = doc(firestore, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as DocumentData;
  } else {
    return null;
  }
};

/**
 * Elimina un documento de usuario.
 *
 * @param uid - El ID del usuario a eliminar.
 * @returns Una promesa que se resuelve cuando la eliminación se completa.
 */
export const deleteUser = (uid: string) => {
  const userRef = doc(firestore, 'users', uid);
  return deleteDoc(userRef);
};

/**
 * Escucha los cambios en un documento de usuario en tiempo real.
 *
 * @param uid - El ID del usuario.
 * @param cb - Un callback que se ejecuta con los datos del usuario (o null si no existe).
 * @returns Una función para cancelar la suscripción.
 */
export const listenUser = (uid: string, cb: (row: DocumentData | null) => void) => {
  const userRef = doc(firestore, 'users', uid);

  const unsubscribe = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      cb({ id: doc.id, ...doc.data() });
    } else {
      cb(null);
    }
  });

  return unsubscribe;
};
