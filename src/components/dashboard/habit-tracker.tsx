"use client"

import React from "react"
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
  const { habits, toggleHabitCompletion, getStreak, isClient } = useAppData()
  const today = new Date()
  const todayString = today.toISOString().split("T")[0]

  const dailyHabits = habits.filter(h => h.frequency === 'daily');

  if (!isClient) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="text-primary" />
            Today's Habits
          </CardTitle>
          <CardDescription>Check off your habits for today.</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="text-primary" />
          Today's Habits
        </CardTitle>
        <CardDescription>Check off your habits for today to build your streak.</CardDescription>
      </CardHeader>
      <CardContent>
        {dailyHabits.length > 0 ? (
          <div className="space-y-4">
            {dailyHabits.map((habit) => {
              const isCompleted = habit.completedDates.includes(todayString)
              const streak = getStreak(habit)
              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`habit-${habit.id}`}
                      checked={isCompleted}
                      onCheckedChange={() => toggleHabitCompletion(habit.id, today)}
                    />
                    <label
                      htmlFor={`habit-${habit.id}`}
                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <Icon name={habit.icon as IconName} className="h-5 w-5 text-muted-foreground" />
                      {habit.name}
                    </label>
                  </div>
                  {streak > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      {streak}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No daily habits set yet. Go to the 'Habits' page to create one!</p>
        )}
      </CardContent>
    </Card>
  )
}
