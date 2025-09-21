// src/lib/utils/ref-guards.ts
export function assertNonEmptyId(label: string, id?: string | null): string {
  const clean = typeof id === "string" ? id.trim() : "";
  if (!clean) {
    // Puedes temporalmente imprimir stack si DEBUG=1
    if (process.env.NEXT_PUBLIC_DEBUG_FIRESTORE === "1") {
      // Evita console.trace en prod
      // eslint-disable-next-line no-console
      console.error(`[ASSERT] ${label} => id vacío`, { id, typeofId: typeof id });
    }
    throw new Error(`EMPTY_ID:${label}`);
  }
  return clean;
}

export const idOrThrow = assertNonEmptyId;
