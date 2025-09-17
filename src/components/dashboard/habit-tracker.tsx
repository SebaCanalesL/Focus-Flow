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
import { Flame, Target, CheckCircle } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Habit } from "@/lib/types"

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};


export function TodaysHabitsCard({ habits }: { habits: Habit[]}) {
  const { toggleHabitCompletion, getStreak, getWeekCompletion, isClient } = useAppData()
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
          <CardDescription>Cumple hoy y mantén tu racha</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="text-primary" />
          Tus hábitos de hoy
        </CardTitle>
        <CardDescription>Cumple hoy y mantén tu racha</CardDescription>
      </CardHeader>
      <CardContent>
        {habits.length > 0 ? (
          <div className="space-y-4">
            {habits.map((habit) => {
              const isCompleted = habit.completedDates.includes(todayString)
              const streak = getStreak(habit)
              const isWeekly = habit.frequency === 'weekly';
              const streakUnit = isWeekly ? (streak === 1 ? "semana" : "semanas") : (streak === 1 ? "día" : "días");
              const weekCompletion = isWeekly ? getWeekCompletion(habit) : null;
              const isWeeklyGoalMet = isWeekly && weekCompletion && weekCompletion.completed >= weekCompletion.total;

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
                      {isWeekly && weekCompletion && (
                          <span className="text-xs text-muted-foreground font-normal">
                              ({weekCompletion.completed}/{weekCompletion.total})
                          </span>
                      )}
                    </label>
                  </div>
                    <div className="flex items-center gap-2">
                         {isWeeklyGoalMet && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {streak > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            {streak} {streakUnit}
                            </Badge>
                        )}
                    </div>
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

export function CompletedWeeklyHabitsCard({ habits }: { habits: Habit[] }) {
    if (habits.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="text-green-500" />
                    ¡Metas semanales cumplidas!
                </CardTitle>
                <CardDescription>Estos hábitos ya cumplieron su meta para la semana. ¡Excelente trabajo!</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {habits.map(habit => (
                        <div key={habit.id} className="flex items-center gap-3 rounded-lg border p-3 bg-secondary/30">
                            <Icon name={habit.icon as IconName} className="h-5 w-5 text-muted-foreground" />
                            <p className="text-sm font-medium text-muted-foreground">{habit.name}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
