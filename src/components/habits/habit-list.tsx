'use client';

import React, { useMemo } from 'react';
import { useAppData } from '@/contexts/app-provider';
import { HabitCardWithGrid } from './habit-card-with-grid';
import type { Habit } from '@/lib/types';

export function HabitList() {
  const { habits: appHabits, isClient } = useAppData();

  const sortedHabits = useMemo(() => {
    return [...appHabits].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [appHabits]);
  
  if (!isClient) {
    return (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-md w-full animate-pulse"/>
            ))}
        </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {sortedHabits.map((habit, index) => (
        <HabitCardWithGrid key={`habit-${habit.id}-${index}`} habit={habit} section="default" />
      ))}
    </div>
  );
}
