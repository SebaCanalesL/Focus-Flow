"use client";

import { GratitudeJournal } from "@/components/dashboard/gratitude-journal";
import { TodaysHabitsCard, CompletedWeeklyHabitsCard } from "@/components/dashboard/habit-tracker";
import { useAppData } from "@/contexts/app-provider";
import { startOfToday, isSameDay } from 'date-fns';

export default function DashboardPage() {
  const { user, habits, getWeekCompletion } = useAppData();

  const getUsername = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Hola';
  }

  const today = startOfToday();

  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  
  const weeklyHabits = habits.filter(h => h.frequency === 'weekly');

  const todaysWeeklyHabits = weeklyHabits.filter(h => {
      const { completed, total } = getWeekCompletion(h);
      if (completed < total) return true;

      // If completed, check if the last completion was today
      const lastCompletion = h.completedDates.map(d => new Date(d)).sort((a,b) => b.getTime() - a.getTime())[0];
      if (lastCompletion && isSameDay(lastCompletion, today)) {
          return true;
      }
      return false;
  });

  const completedWeeklyHabits = weeklyHabits.filter(h => {
      const { completed, total } = getWeekCompletion(h);
      if(completed < total) return false;

      const lastCompletion = h.completedDates.map(d => new Date(d)).sort((a,b) => b.getTime() - a.getTime())[0];
       if (lastCompletion && isSameDay(lastCompletion, today)) {
          return false;
      }
      return true;
  });
  
  const habitsToShowToday = [...dailyHabits, ...todaysWeeklyHabits];


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Hola {getUsername()}. Que bueno verte bien 😁</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <GratitudeJournal />
        <div className="flex flex-col gap-6">
            <TodaysHabitsCard habits={habitsToShowToday} />
            <CompletedWeeklyHabitsCard habits={completedWeeklyHabits} />
        </div>
      </div>
    </div>
  );
}
