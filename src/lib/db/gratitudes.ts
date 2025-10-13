
import { doc, collection, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { idOrThrow } from "@/lib/utils/ref-guards";
import { GratitudeEntry } from "@/lib/types";

// Export the GratitudeEntry type for use in other files
export type { GratitudeEntry };

export async function createGratitude(input: Omit<GratitudeEntry, "id">) {
  const col = collection(db, "gratitudes");
  return addDoc(col, input);
}

export async function updateGratitude(id: string, data: Partial<GratitudeEntry>) {
  const cleanId = idOrThrow("updateGratitude.id", id);
  const ref = doc(db, "gratitudes", cleanId);
  return updateDoc(ref, data);
}
