"use client";

import { CreateHabitDialog } from "@/components/habits/create-habit-dialog";
import { HabitList } from "@/components/habits/habit-list";

export default function HabitsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Your Habits</h1>
        <CreateHabitDialog />
      </div>
      <HabitList />
    </div>
  );
}
