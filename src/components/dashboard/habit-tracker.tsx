
"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppData } from "@/contexts/app-provider"
import { Flame, Target, CheckCircle, Circle, CheckCircle2 } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Habit } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};


export function TodaysHabitsCard({ habits }: { habits: Habit[]}) {
  const { toggleHabitCompletion, getStreak, getWeekCompletion, isClient } = useAppData()
  
  if (!isClient) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="text-primary" />
            Tus hábitos de hoy
          </CardTitle>
          <CardDescription>Sigue cumpliendo y mantén tu racha</CardDescription>
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
  
  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');

  const pendingHabits = habits.filter(h => !h.completedDates.includes(todayString));
  const completedHabits = habits.filter(h => h.completedDates.includes(todayString));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="text-primary" />
          Tus hábitos de hoy
        </CardTitle>
        <CardDescription>Sigue cumpliendo y mantén tu racha</CardDescription>
      </CardHeader>
      <CardContent>
        {habits.length > 0 ? (
          <div className="space-y-3">
            {pendingHabits.map((habit) => {
              const streak = getStreak(habit)
              const isWeekly = habit.frequency === 'weekly';
              const streakUnit = isWeekly ? (streak === 1 ? "semana" : "semanas") : (streak === 1 ? "día" : "días");
              const weekCompletion = isWeekly ? getWeekCompletion(habit) : null;

              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleHabitCompletion(habit.id, today)} aria-label={`Marcar ${habit.name} como completado`}>
                        <Circle className="h-6 w-6 text-muted-foreground/50" />
                    </button>
                    <div
                      className="flex items-center gap-2 text-sm font-medium leading-none"
                    >
                      <Icon name={habit.icon as IconName} className="h-5 w-5 text-muted-foreground" />
                      {habit.name}
                      {isWeekly && weekCompletion && (
                          <span className="text-xs text-muted-foreground font-normal">
                              ({weekCompletion.completed}/{weekCompletion.total})
                          </span>
                      )}
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                        {streak > 0 && (
                            <Badge variant="secondary" className="flex flex-col items-center justify-center p-1 px-2 h-auto leading-none rounded-md">
                                <div className="flex items-center gap-1">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                    <span className="font-semibold text-sm">{streak}</span>
                                </div>
                                <span className="text-xs font-normal">{streakUnit}</span>
                            </Badge>
                        )}
                    </div>
                </div>
              )
            })}

            {completedHabits.length > 0 && pendingHabits.length > 0 && (
                 <div className="relative pt-2 pb-1">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-dashed border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-card px-3 text-xs uppercase text-muted-foreground">Completados</span>
                    </div>
                </div>
            )}

            {completedHabits.map((habit) => {
                const streak = getStreak(habit)
                const isWeekly = habit.frequency === 'weekly';
                const streakUnit = isWeekly ? (streak === 1 ? "semana" : "semanas") : (streak === 1 ? "día" : "días");
                const weekCompletion = isWeekly ? getWeekCompletion(habit) : null;
                const isWeeklyGoalMet = isWeekly && weekCompletion && weekCompletion.completed >= weekCompletion.total;

                return (
                    <div
                    key={habit.id}
                    className="flex items-center justify-between rounded-lg border p-3 bg-muted/20"
                    >
                    <div className="flex items-center gap-3">
                        <button onClick={() => toggleHabitCompletion(habit.id, today)} aria-label={`Marcar ${habit.name} como pendiente`}>
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </button>
                        <div
                            className="flex items-center gap-2 text-sm font-medium leading-none text-muted-foreground"
                        >
                            <Icon name={habit.icon as IconName} className="h-5 w-5 text-muted-foreground" />
                            {habit.name}
                            {isWeekly && weekCompletion && (
                                <span className="text-xs font-normal">
                                    ({weekCompletion.completed}/{weekCompletion.total})
                                </span>
                            )}
                        </div>
                    </div>
                        <div className="flex items-center gap-2">
                            {isWeeklyGoalMet && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {streak > 0 && (
                                <Badge variant="secondary" className="flex flex-col items-center justify-center p-1 px-2 h-auto leading-none rounded-md bg-background/70">
                                    <div className="flex items-center gap-1">
                                        <Flame className="h-4 w-4 text-orange-500/70" />
                                        <span className="font-semibold text-sm">{streak}</span>
                                    </div>
                                    <span className="text-xs font-normal">{streakUnit}</span>
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
    const { getStreak, getWeekCompletion } = useAppData();

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
                <CardDescription>Ya cumpliste con la meta semanal de estos hábitos. ¡Excelente trabajo!</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {habits.map(habit => {
                        const streak = getStreak(habit);
                        const streakUnit = streak === 1 ? "semana" : "semanas";
                        const weekCompletion = getWeekCompletion(habit);
                        
                        return (
                            <div key={habit.id} className="flex items-center justify-between rounded-lg border p-3 bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    <Icon name={habit.icon as IconName} className="h-5 w-5 text-muted-foreground" />
                                    <p className="text-sm font-medium text-muted-foreground">{habit.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <p className="text-sm font-medium text-muted-foreground">
                                        ({weekCompletion.completed}/{weekCompletion.total})
                                    </p>
                                    {streak > 0 && (
                                        <Badge variant="secondary" className="flex flex-col items-center justify-center p-1 px-2 h-auto leading-none rounded-md">
                                            <div className="flex items-center gap-1">
                                                <Flame className="h-4 w-4 text-orange-500" />
                                                <span className="font-semibold text-sm">{streak}</span>
                                            </div>
                                            <span className="text-xs font-normal">{streakUnit}</span>
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
