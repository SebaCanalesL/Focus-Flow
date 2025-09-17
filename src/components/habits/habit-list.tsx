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
import { Badge } from "@/components/ui/badge"
import { Target, Footprints, BookOpen, ClipboardCheck } from "lucide-react"
import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};


export function HabitList() {
  const { habits, isClient } = useAppData()

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Habits</CardTitle>
          <CardDescription>A list of all your tracked habits.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-md w-full animate-pulse" />
            ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Habits</CardTitle>
        <CardDescription>A list of all your tracked habits.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <Card key={habit.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Icon name={habit.icon as IconName} className="h-5 w-5 text-primary" />
                {habit.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
               <Badge variant="outline">{habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}</Badge>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
