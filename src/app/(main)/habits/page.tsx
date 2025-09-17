"use client";

import { HabitList } from "@/components/habits/habit-list";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function HabitsPage() {
  const today = new Date();
  const formattedDate = format(today, "eeee, d 'de' MMMM", { locale: es });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tus Hábitos</h1>
          <p className="text-muted-foreground">
            Hoy es {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
          </p>
        </div>
      </div>
      <HabitList />
    </div>
  );
}
