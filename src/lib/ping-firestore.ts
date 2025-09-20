'use client';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function pingFirestore() {
  const ref = doc(db, '_debug/_ping');
  await setDoc(ref, { t: serverTimestamp(), ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'server' });
  return 'PING write OK';
}
