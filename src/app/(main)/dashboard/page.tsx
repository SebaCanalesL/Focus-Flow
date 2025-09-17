"use client";

import { AiHabitSuggestions } from "@/components/dashboard/ai-habit-suggestions";
import { GratitudeJournal } from "@/components/dashboard/gratitude-journal";
import { HabitTracker } from "@/components/dashboard/habit-tracker";
import { useAppData } from "@/contexts/app-provider";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAppData();

  const getUsername = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Hola';
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Hola {getUsername()}, qué bueno verte bien.</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <GratitudeJournal />
            <HabitTracker />
        </div>
        <div className="space-y-6">
            <AiHabitSuggestions />
        </div>
      </div>
    </div>
  );
}
