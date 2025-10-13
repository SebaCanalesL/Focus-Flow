
import { doc, collection, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { idOrThrow } from "@/lib/utils/ref-guards";
import { Habit } from "@/lib/types";

// Export the Habit type for use in other files
export type { Habit };

export async function createHabit(input: Omit<Habit, "id">) {
  // create NO usa id externo
  const { /* id: _omit, */ ...payload } = input;
  const col = collection(db, "habits");
  return addDoc(col, payload);
}

export async function updateHabit(id: string, data: Partial<Habit>) {
  const cleanId = idOrThrow("updateHabit.id", id);
  const ref = doc(db, "habits", cleanId);
  return updateDoc(ref, data);
}
