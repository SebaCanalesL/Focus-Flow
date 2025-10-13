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

const HabitCompletionGrid = ({ habit, section = 'default' }: { habit: Habit; section?: string }) => {
  const { completedDates, createdAt, frequency, daysPerWeek } = habit;
  const isWeekly = frequency === 'weekly';
  const completedDatesSet = useMemo(() => new Set(completedDates), [completedDates]);
  const habitCreationDate = useMemo(() => startOfDay(toDate(createdAt)), [createdAt]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const monthsToShow = useMemo(() => {
    const start = startOfMonth(habitCreationDate);
    const end = startOfMonth(addMonths(today, 1));
    const months = [];
    let current = start;
    while (isBefore(current, end) || isSameMonth(current, end)) {
      months.push(current);
      current = addMonths(current, 1);
    }
    return months;
  }, [habitCreationDate, today]);

  const getDaysForMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  // Get all days from all months in a continuous sequence
  const allDays = useMemo(() => {
    const days = [];
    for (const month of monthsToShow) {
      days.push(...getDaysForMonth(month));
    }
    return days;
  }, [monthsToShow]);

  // Get month labels for display - corrected logic
  const monthLabels = useMemo(() => {
    const labels = [];
    let currentMonth = null;
    let monthStartIndex = 0;
    
    for (let i = 0; i < allDays.length; i++) {
      const day = allDays[i];
      const dayMonth = startOfMonth(day);
      
      if (currentMonth === null) {
        // First day
        currentMonth = dayMonth;
        monthStartIndex = i;
      } else if (!isSameMonth(dayMonth, currentMonth)) {
        // Month changed, save previous month
        labels.push({
          month: currentMonth,
          startIndex: monthStartIndex,
          endIndex: i - 1
        });
        
        // Start new month
        currentMonth = dayMonth;
        monthStartIndex = i;
      }
    }
    
    // Don't forget the last month
    if (currentMonth !== null) {
      labels.push({
        month: currentMonth,
        startIndex: monthStartIndex,
        endIndex: allDays.length - 1
      });
    }
    
    return labels;
  }, [allDays]);

  // Use CSS grid positioning instead of pixel calculations
  const totalDays = allDays.length;

  return (
    <div className="flex justify-start items-end gap-x-3 overflow-x-auto pb-2">
      <div className="grid grid-rows-7 gap-[var(--dot-gap)] shrink-0">
        {weekDays.map((day, i) => (
          <div key={`${habit.id}-${section}-weekday-${i}-${Date.now()}`} className="text-xs text-muted-foreground w-4 h-[var(--dot-size)] flex items-center justify-center">{day}</div>
        ))}
      </div>
      <div className="flex flex-col items-start">
        {/* Month labels using CSS Grid for perfect alignment */}
        <div className="grid grid-flow-col mb-1" style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}>
          {monthLabels.map((label, index) => {
            return (
              <div 
                key={`${habit.id}-${section}-month-${format(label.month, 'yyyy-MM')}-${index}-${Date.now()}`}
                className="flex justify-center items-center"
                style={{ 
                  gridColumn: `${label.startIndex + 1} / span ${label.endIndex - label.startIndex + 1}`
                }}
              >
                <p className="text-xs text-muted-foreground capitalize">{format(label.month, 'MMM', { locale: es })}</p>
              </div>
            );
          })}
        </div>
        {/* Continuous grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-[var(--dot-gap)]">
          {allDays.map((day, dayIndex) => {
            const dayString = format(day, 'yyyy-MM-dd');
            const isCompleted = completedDatesSet.has(dayString);
            const isFuture = day > today;
            const isPast = isBefore(day, today);
            const isCurrentMonth = monthsToShow.some(month => isSameMonth(day, month));
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
                key={`${habit.id}-${section}-day-${dayIndex}-${dayString}`}
                className={cn('w-[var(--dot-size)] h-[var(--dot-size)] rounded-[3px]', dayBgClass)}
                title={dayString}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { HabitCompletionGrid };
