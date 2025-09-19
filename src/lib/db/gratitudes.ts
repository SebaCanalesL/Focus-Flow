
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { GratitudeEntry } from '../types';

type GratitudeInput = Partial<Omit<GratitudeEntry, 'id' | 'createdAt' | 'updatedAt'>
>;
/**
 * Crea o actualiza un registro de gratitud para un usuario.
 * Si el registro no existe, añade `createdAt`. Siempre actualiza `updatedAt`.
 *
 * @param uid - El ID del usuario.
 * @param gratitudeId - El ID del registro de gratitud.
 * @param data - Los datos a guardar.
 * @returns Una promesa que se resuelve al completar la operación.
 */
export const upsertGratitude = async (
  uid: string,
  gratitudeId: string,
  data: GratitudeInput
) => {
  const gratitudeRef = doc(firestore, `users/${uid}/gratitudes`, gratitudeId);
  const docSnap = await getDoc(gratitudeRef);

  const dataToSet = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  if (!docSnap.exists()) {
    (dataToSet as any).createdAt = Timestamp.now();
  }

  return setDoc(gratitudeRef, dataToSet, { merge: true });
};

/**
 * Obtiene un registro de gratitud por su ID.
 *
 * @param uid - El ID del usuario.
 * @param gratitudeId - El ID del registro de gratitud.
 * @returns El registro de gratitud o null si no se encuentra.
 */
export const getGratitude = async (uid: string, gratitudeId: string) => {
  const gratitudeRef = doc(firestore, `users/${uid}/gratitudes`, gratitudeId);
  const docSnap = await getDoc(gratitudeRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as GratitudeEntry;
  }
  return null;
};

/**
 * Elimina un registro de gratitud.
 *
 * @param uid - El ID del usuario.
 * @param gratitudeId - El ID del registro a eliminar.
 * @returns Una promesa que se resuelve al completar la eliminación.
 */
export const deleteGratitude = (uid: string, gratitudeId: string) => {
  const gratitudeRef = doc(firestore, `users/${uid}/gratitudes`, gratitudeId);
  return deleteDoc(gratitudeRef);
};

/**
 * Lista los registros de gratitud de un usuario para una fecha específica.
 *
 * @param uid - El ID del usuario.
 * @param date - La fecha en formato YYYY-MM-DD.
 * @returns Un array con los registros de gratitud encontrados.
 */
export const listGratitudesByDate = async (uid: string, date: string) => {
  const gratitudesCol = collection(firestore, `users/${uid}/gratitudes`);
  const q = query(gratitudesCol, where('date', '==', date));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as GratitudeEntry)
  );
};

/**
 * Escucha en tiempo real los registros de gratitud de un usuario.
 *
 * @param uid - El ID del usuario.
 * @param cb - El callback que se ejecuta con la lista de registros.
 * @returns Una función para cancelar la suscripción.
 */
export const listenGratitudes = (uid: string, cb: (rows: GratitudeEntry[]) => void) => {
  const gratitudesCol = collection(firestore, `users/${uid}/gratitudes`);
  // Se puede ordenar si existe un índice compuesto, o por defecto por ID.
  const q = query(gratitudesCol, orderBy('date', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const gratitudes = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as GratitudeEntry)
    );
    cb(gratitudes);
  });

  return unsubscribe;
};
