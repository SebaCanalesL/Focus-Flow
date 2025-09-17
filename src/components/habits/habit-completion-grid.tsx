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
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Habit } from '@/lib/types';


const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const HabitCompletionGrid = ({ habit }: { habit: Habit }) => {
  const { completedDates } = habit;
  const completedDatesSet = useMemo(() => new Set(completedDates), [completedDates]);

  const monthsToShow = useMemo(() => {
    const today = new Date();
    const currentMonth = startOfMonth(today);
    const prevMonth = startOfMonth(subMonths(today, 1));
    const prev2Month = startOfMonth(subMonths(today, 2));

    return [prev2Month, prevMonth, currentMonth].sort((a, b) => a.getTime() - b.getTime());
  }, []);
  
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
                  const isFuture = day > new Date() && dayString !== format(new Date(), 'yyyy-MM-dd');
                  const isCurrentMonth = isSameMonth(day, month);

                  return (
                    <div
                      key={dayString}
                      className={cn(
                        'w-[var(--dot-size)] h-[var(--dot-size)] rounded-sm',
                        isFuture ? 'bg-transparent' : 'bg-muted/50',
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
