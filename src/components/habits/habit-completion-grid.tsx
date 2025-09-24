'use client';

import { useMemo } from 'react';
import {
  addMonths,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Habit } from '@/lib/types';

const toDate = (date: string | Date | { toDate: () => Date } | null | undefined): Date => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  if (typeof date === 'object' && date !== null && typeof (date as { toDate: () => Date }).toDate === 'function') {
    return (date as { toDate: () => Date }).toDate();
  }
  return new Date(date as string | Date);
};

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const HabitCompletionGrid = ({ habit }: { habit: Habit }) => {
  const { completedDates, createdAt, frequency, daysPerWeek } = habit;
  const isWeekly = frequency === 'weekly';
  const completedDatesSet = useMemo(() => new Set(completedDates), [completedDates]);
  const habitCreationDate = useMemo(() => startOfDay(toDate(createdAt)), [createdAt]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const monthsToShow = useMemo(() => {
    const currentMonth = startOfMonth(today);
    const nextMonth = startOfMonth(addMonths(today, 1));
    return [currentMonth, nextMonth];
  }, [today]);

  const getDaysForMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

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
            <div className="grid grid-flow-col grid-rows-7 gap-[var(--dot-gap)]">
              {getDaysForMonth(month).map((day) => {
                const dayString = format(day, 'yyyy-MM-dd');
                const isCompleted = completedDatesSet.has(dayString);
                const isFuture = day > today;
                const isPast = isBefore(day, today);
                const isCurrentMonth = isSameMonth(day, month);
                const isBeforeCreation = isBefore(day, habitCreationDate);

                let dayBgClass = 'bg-transparent';

                if (isCurrentMonth) {
                    if (isFuture) {
                        dayBgClass = 'bg-muted/50';
                    } else if (isBeforeCreation) {
                        dayBgClass = 'bg-transparent';
                    } else if (isCompleted) {
                        dayBgClass = 'bg-green-500'; // Green for completed
                    } else if (isPast) {
                        if (isWeekly) {
                            const weekStart = startOfWeek(day, { weekStartsOn: 1 });
                            const weekEnd = endOfWeek(day, { weekStartsOn: 1 });
                            const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
                            
                            const completionsInWeek = daysInWeek.reduce((count, weekDay) => {
                                return completedDatesSet.has(format(weekDay, 'yyyy-MM-dd')) ? count + 1 : count;
                            }, 0);

                            const daysLeft = differenceInDays(weekEnd, day) + 1;
                            const completionsStillNeeded = (daysPerWeek || 1) - completionsInWeek;

                            if (completionsStillNeeded > daysLeft) {
                                dayBgClass = 'bg-red-500'; // Impossible to meet goal
                            } else {
                                dayBgClass = 'bg-yellow-500'; // Missed, but goal was still possible
                            }
                        } else {
                            const previousDay = subDays(day, 1);
                            if (completedDatesSet.has(format(previousDay, 'yyyy-MM-dd')) && !isBefore(previousDay, habitCreationDate)) {
                                dayBgClass = 'bg-red-500'; // Red for broken daily streaks
                            } else {
                                dayBgClass = 'bg-yellow-500'; // Yellow for other missed days
                            }
                        }
                    } else {
                        dayBgClass = 'bg-muted/50'; // Today, not completed yet
                    }
                }

                return (
                  <div
                    key={dayString}
                    className={cn('w-[var(--dot-size)] h-[var(--dot-size)] rounded-[3px]', dayBgClass)}
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
