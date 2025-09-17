"use client";

import { AiHabitSuggestions } from "@/components/dashboard/ai-habit-suggestions";
import { GratitudeJournal } from "@/components/dashboard/gratitude-journal";
import { HabitTracker } from "@/components/dashboard/habit-tracker";
import { useAppData } from "@/contexts/app-provider";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Hola");
  const { user } = useAppData();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Buenos días");
    } else if (hour < 18) {
      setGreeting("Buenas tardes");
    } else {
      setGreeting("Buenas noches");
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">{greeting}, empecemos el día con todo.</h1>
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
