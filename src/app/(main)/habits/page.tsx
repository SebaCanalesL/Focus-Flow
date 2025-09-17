"use client";

import { HabitList } from "@/components/habits/habit-list";
import { CreateHabitDialog } from "@/components/habits/create-habit-dialog";

export default function HabitsPage() {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hábitos</h1>
          <p className="text-muted-foreground">
            El progreso se construye a la velocidad de tu constancia.
          </p>
        </div>
        <CreateHabitDialog />
      </div>
      <HabitList />
    </div>
  );
}
