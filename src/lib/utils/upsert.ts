// src/lib/utils/upsert.ts
export type UpsertParams<T> = {
  id?: string | null;
  data: T;
  entity: string; // "habit" | "gratitude" | "user" | etc.
  create: (data: T) => Promise<unknown>;
  update: (id: string, data: Partial<T> | T) => Promise<unknown>;
};

export function sanitizeId(id?: string | null): string {
  return typeof id === "string" ? id.trim() : "";
}

export function hasNonEmptyId(id?: string | null): boolean {
  return sanitizeId(id).length > 0;
}

/**
 * upsert<T>:
 * - Si hay id no vacío => update(id,data).
 * - Si no hay id => create(data).
 * - Loguea operación e id para trazabilidad.
 */
export async function upsert<T>({
  id,
  data,
  entity,
  create,
  update,
}: UpsertParams<T>) {
  const cleanId = sanitizeId(id);

  if (cleanId) {
    console.log(`[${entity}] update`, { id: cleanId });
    return update(cleanId, data);
  }

  console.log(`[${entity}] create`);
  return create(data);
}
