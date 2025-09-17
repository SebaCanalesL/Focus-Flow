"use client"

import React from "react"
import { useAppData } from "@/contexts/app-provider"
import { HabitCardWithGrid } from "./habit-card-with-grid"

export function HabitList() {
  const { habits, isClient } = useAppData()

  if (!isClient) {
    return (
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-md w-full animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {habits.map((habit) => (
        <HabitCardWithGrid key={habit.id} habit={habit} />
      ))}
    </div>
  )
}
