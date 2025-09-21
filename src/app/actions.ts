
"use server";

import { createHabit, updateHabit, type Habit } from "@/lib/db/habits";
import { createGratitude, updateGratitude, type GratitudeEntry } from "@/lib/db/gratitudes";
import { createUser } from "@/lib/db/users";
import { idOrThrow } from "@/lib/utils/ref-guards";

// HABITS
type HabitInput = Habit;

export async function saveHabitAction(input: HabitInput) {
  // Log mínimo
  console.log("[habit] saveHabitAction", { id: input?.id });

  const id = (input?.id ?? "").trim();
  if (id) {
    idOrThrow("saveHabitAction.id", id); // redundante pero claro
    return updateHabit(id, input);
  }
  const payload: Partial<Habit> = { ...input };
  delete payload.id;
  return createHabit(payload as Omit<Habit, "id">);
}

// GRATITUDES
type GratitudeInput = GratitudeEntry;

export async function saveGratitudeAction(input: GratitudeInput) {
  console.log("[gratitude] saveGratitudeAction", { id: input?.id });

  const id = (input?.id ?? "").trim();
  if (id) {
    idOrThrow("saveGratitudeAction.id", id);
    return updateGratitude(id, input);
  }
  const payload: Partial<GratitudeEntry> = { ...input };
  delete payload.id;
  return createGratitude(payload as Omit<GratitudeEntry, "id">);
}

// USER PROFILE (upsert via merge)
export async function saveUserProfileAction(input: { uid: string } & Record<string, unknown>) {
  idOrThrow("saveUserProfileAction.uid", input?.uid);
  console.log("[user] saveUserProfileAction", { uid: input.uid });
  return createUser(input);
}
