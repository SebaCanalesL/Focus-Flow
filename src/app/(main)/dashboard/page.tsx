"use client";

import { AiHabitSuggestions } from "@/components/dashboard/ai-habit-suggestions";
import { GratitudeJournal } from "@/components/dashboard/gratitude-journal";
import { HabitTracker } from "@/components/dashboard/habit-tracker";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">{greeting}, let's have a great day.</h1>
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
