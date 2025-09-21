
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { idOrThrow } from "@/lib/utils/ref-guards";

export async function getUser(uid?: string | null) {
  const clean = idOrThrow("getUser.uid", uid);
  const ref = doc(db, "users", clean);
  const snap = await getDoc(ref);
  return snap.data() ?? null;
}

export async function createUser(data: { uid: string } & Record<string, unknown>) {
  const clean = idOrThrow("createUser.uid", data?.uid);
  const ref = doc(db, "users", clean);
  // upsert real
  await setDoc(ref, data, { merge: true });
}
