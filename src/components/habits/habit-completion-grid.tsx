"use client";

import { useMemo } from 'react';
import {
  eachDayOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  subMonths,
  isBefore,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Habit } from '@/lib/types';

// Helper to convert Firestore Timestamps or other formats to a JS Date object
const toDate = (date: any): Date => {
  if (!date) return new Date(); // Fallback for undefined/null
  if (date instanceof Date) {
    return date;
  }
  // Firestore Timestamps have a toDate method
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  // Handle ISO strings or other string formats
  return new Date(date);
};

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const HabitCompletionGrid = ({ habit }: { habit: Habit }) => {
  const { completedDates, createdAt } = habit;
  const completedDatesSet = useMemo(() => new Set(completedDates), [completedDates]);
  const habitCreationDate = useMemo(() => startOfDay(toDate(createdAt)), [createdAt]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const monthsToShow = useMemo(() => {
    const currentMonth = startOfMonth(today);
    const prevMonth = startOfMonth(subMonths(today, 1));
    const prev2Month = startOfMonth(subMonths(today, 2));

    const months = [prev2Month, prevMonth, currentMonth].sort((a, b) => a.getTime() - b.getTime());
    const habitCreationMonth = startOfMonth(habitCreationDate);

    // If habitCreationDate is invalid, getTime() will be NaN, and this will return an empty array
    if (isNaN(habitCreationMonth.getTime())) {
        return [prev2Month, prevMonth, currentMonth];
    }

    return months.filter(month => month.getTime() >= habitCreationMonth.getTime());
  }, [today, habitCreationDate]);
  
  const getDaysForMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const weekOptions = { weekStartsOn: 1 as const };
    const startDate = startOfWeek(monthStart, weekOptions);
    const endDate = endOfWeek(monthEnd, weekOptions);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }

  return (
    <div className="flex justify-start items-end gap-x-3 overflow-x-auto pb-2">
      <div className="grid grid-rows-7 gap-[var(--dot-gap)] shrink-0">
          {weekDays.map((day, i) => (
              <div key={i} className="text-xs text-muted-foreground w-4 h-[var(--dot-size)] flex items-center justify-center">{day}</div>
          ))}
      </div>
      <div className="flex justify-start items-end gap-x-3 overflow-x-auto">
        {monthsToShow.map((month) => (
            <div key={format(month, 'yyyy-MM')} className="flex flex-col items-center gap-1 shrink-0">
              <p className="text-xs text-muted-foreground capitalize">{format(month, 'MMM', { locale: es })}</p>
              <div
                  className="grid grid-flow-col grid-rows-7 gap-[var(--dot-gap)]"
              >
                {getDaysForMonth(month).map((day) => {
                  const dayString = format(day, 'yyyy-MM-dd');
                  const isCompleted = completedDatesSet.has(dayString);
                  const isFuture = day > today;
                  const isCurrentMonth = isSameMonth(day, month);
                  const isBeforeCreation = isBefore(day, habitCreationDate);

                  return (
                    <div
                      key={dayString}
                      className={cn(
                        'w-[var(--dot-size)] h-[var(--dot-size)] rounded-sm',
                        isFuture || isBeforeCreation ? 'bg-transparent' : 'bg-muted/50',
                         !isCurrentMonth && 'bg-transparent',
                         isCompleted && 'bg-primary'
                      )}
                      title={dayString}
                    />
                  );
                })}
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export { HabitCompletionGrid };
