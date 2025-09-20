"use server";

import {
  deleteHabit,
  upsertGratitude,
  upsertHabit,
  upsertUser,
} from "../lib/db";

// Helper para obtener el usuario actual.
// TODO: Reemplazar con la lógica real de autenticación (Firebase/NextAuth).
async function getCurrentUser(): Promise<{ uid: string } | null> {
  // Por ahora, devolvemos un usuario de demostración.
  return { uid: "demo-user" };
}

/**
 * Guarda (crea o actualiza) un hábito para el usuario autenticado.
 */
export async function saveHabitAction(habitId: string, data: any) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autenticado");
  }

  await upsertHabit(user.uid, habitId, data);
  return { ok: true };
}

/**
 * Elimina un hábito del usuario autenticado.
 */
export async function deleteHabitAction(habitId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autenticado");
  }

  await deleteHabit(user.uid, habitId);
  return { ok: true };
}

/**
 * Guarda (crea o actualiza) un registro de gratitud.
 */
export async function saveGratitudeAction(gratitudeId: string, data: any) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autenticado");
  }

  await upsertGratitude(user.uid, gratitudeId, data);
  return { ok: true };
}

/**
 * Guarda (crea o actualiza) el perfil del usuario.
 */
export async function saveUserProfileAction(data: any) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autenticado");
  }

  await upsertUser(user.uid, data);
  return { ok: true };
}
