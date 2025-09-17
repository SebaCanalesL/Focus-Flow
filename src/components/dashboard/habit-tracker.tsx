"use client"

import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAppData } from "@/contexts/app-provider"
import { Flame, Target } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Badge } from "@/components/ui/badge"

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};


export function HabitTracker() {
  const { habits, toggleHabitCompletion, getStreak, getWeekCompletion, isClient } = useAppData()
  const [today, setToday] = useState<Date | null>(null);
  
  useEffect(() => {
    setToday(new Date());
  }, []);

  if (!isClient || !today) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="text-primary" />
            Tus hábitos de hoy
          </CardTitle>
          <CardDescription>Completa tus hábitos de hoy.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="h-8 bg-muted rounded-md w-full animate-pulse" />
                <div className="h-8 bg-muted rounded-md w-full animate-pulse" />
                <div className="h-8 bg-muted rounded-md w-full animate-pulse" />
            </div>
        </CardContent>
      </Card>
    )
  }
  
  const todayString = today.toISOString().split("T")[0]
  
  const habitsToShow = habits.filter(habit => {
    if (habit.frequency === 'daily') {
        return true;
    }
    if (habit.frequency === 'weekly') {
        const { completed, total } = getWeekCompletion(habit);
        return completed < total;
    }
    return false;
  });


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="text-primary" />
          Tus hábitos de hoy
        </CardTitle>
        <CardDescription>Completa tus hábitos para aumentar tu racha.</CardDescription>
      </CardHeader>
      <CardContent>
        {habitsToShow.length > 0 ? (
          <div className="space-y-4">
            {habitsToShow.map((habit) => {
              const isCompleted = habit.completedDates.includes(todayString)
              const streak = getStreak(habit)
              const isWeekly = habit.frequency === 'weekly';
              const streakUnit = isWeekly ? (streak === 1 ? "semana" : "semanas") : (streak === 1 ? "día" : "días");

              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`habit-today-${habit.id}`}
                      checked={isCompleted}
                      onCheckedChange={() => toggleHabitCompletion(habit.id, today)}
                    />
                    <label
                      htmlFor={`habit-today-${habit.id}`}
                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <Icon name={habit.icon as IconName} className="h-5 w-5 text-muted-foreground" />
                      {habit.name}
                    </label>
                  </div>
                  {streak > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      {streak} {streakUnit}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">¡Felicidades! No tienes hábitos pendientes por ahora.</p>
        )}
      </CardContent>
    </Card>
  )
}
