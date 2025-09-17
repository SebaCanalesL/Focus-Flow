"use client";

import { useMemo } from 'react';
import {
  eachDayOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  getDay,
  isSameMonth,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {toZonedTime} from "date-fns-tz";

// Get user's time zone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const HabitCompletionGrid = ({ completedDates }: { completedDates: string[] }) => {
  const zonedCompletedDates = useMemo(() => new Set(
    completedDates.map(d => {
       const zonedDate = toZonedTime(parseISO(d), userTimeZone);
       return format(zonedDate, "yyyy-MM-dd");
    })
  ), [completedDates]);

  const monthsToShow = useMemo(() => {
    const today = new Date();
    const currentMonth = startOfMonth(today);
    const prevMonth = startOfMonth(new Date(currentMonth).setMonth(currentMonth.getMonth() - 1));
    const prev2Month = startOfMonth(new Date(currentMonth).setMonth(currentMonth.getMonth() - 2));

    return [prev2Month, prevMonth, currentMonth];
  }, []);

  const getMonthGrid = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const firstDayOfMonth = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const daysInGrid = eachDayOfInterval({ start: firstDayOfMonth, end: monthEnd });

    const grid = [];
    let week: (Date | null)[] = [];

    // Pad the beginning of the first week if the month doesn't start on a Monday
    const startingDayIndex = (getDay(monthStart) + 6) % 7; // 0 for Monday, 6 for Sunday
    for (let i = 0; i < startingDayIndex; i++) {
        week.push(null);
    }
    
    daysInGrid.forEach((day, index) => {
      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
      if (isSameMonth(day, monthStart)) {
        week.push(day);
      }
    });

    // Pad the end of the last week
    while (week.length > 0 && week.length < 7) {
      week.push(null);
    }
    grid.push(week);

    return grid;
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
              <div
                  className="grid grid-flow-col grid-rows-7 gap-[var(--dot-gap)]"
              >
                {eachDayOfInterval({ start: startOfWeek(month), end: endOfMonth(month) }).map((day) => {
                  const dayString = format(day, 'yyyy-dd-MM');
                  const isCompleted = zonedCompletedDates.has(dayString);
                  const isFuture = day > new Date();

                  return (
                    <div
                      key={dayString}
                      className={cn(
                        'w-[var(--dot-size)] h-[var(--dot-size)] rounded-sm',
                        isFuture ? 'bg-transparent' : 'bg-muted/50',
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
