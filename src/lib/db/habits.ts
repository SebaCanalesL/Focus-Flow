
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { Habit } from '../types';

/**
 * Crea o actualiza un hábito para un usuario específico.
 * Si el hábito existe, mezcla los nuevos datos con los existentes.
 *
 * @param uid - El ID del usuario.
 * @param habitId - El ID del hábito a crear o actualizar.
 * @param data - Los datos del hábito a guardar.
 * @returns Una promesa que se resuelve cuando la operación se completa.
 */
export const upsertHabit = async (uid: string, habitId: string, data: Partial<Habit>) => {
  const habitRef = doc(firestore, `users/${uid}/habits`, habitId);
  return setDoc(
    habitRef,
    {
      ...data,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

/**
 * Obtiene un hábito específico de un usuario.
 *
 * @param uid - El ID del usuario.
 * @param habitId - El ID del hábito a obtener.
 * @returns Una promesa que se resuelve con los datos del hábito o null si no existe.
 */
export const getHabit = async (uid: string, habitId: string) => {
  const habitRef = doc(firestore, `users/${uid}/habits`, habitId);
  const docSnap = await getDoc(habitRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Habit;
  } else {
    return null;
  }
};

/**
 * Elimina un hábito específico de un usuario.
 *
 * @param uid - El ID del usuario.
 * @param habitId - El ID del hábito a eliminar.
 * @returns Una promesa que se resuelve cuando la operación se completa.
 */
export const deleteHabit = async (uid: string, habitId: string) => {
  const habitRef = doc(firestore, `users/${uid}/habits`, habitId);
  return deleteDoc(habitRef);
};

/**
 * Escucha los cambios en los hábitos de un usuario en tiempo real.
 *
 * @param uid - El ID del usuario.
 * @param cb - Una función de callback que se ejecuta cada vez que los datos cambian.
 *             Recibe un array de hábitos como argumento.
 * @returns Una función para cancelar la suscripción a los cambios.
 */
export const listenHabits = (uid: string, cb: (rows: Habit[]) => void) => {
  const habitsQuery = query(collection(firestore, `users/${uid}/habits`));

  const unsubscribe = onSnapshot(habitsQuery, (querySnapshot) => {
    const habits = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Habit));
    cb(habits);
  });

  return unsubscribe;
};
