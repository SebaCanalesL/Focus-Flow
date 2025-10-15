'use client';

import { useMemo } from 'react';
import {
  addMonths,
  differenceInDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isBefore,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  getDay
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


  // Get all days from habit creation date to today + some future days
  const allDays = useMemo(() => {
    const startDate = habitCreationDate;
    const endDate = addMonths(today, 1); // Show one month into the future
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [habitCreationDate, today]);

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
        {/* Continuous grid with proper day alignment */}
        <div className="grid grid-flow-col grid-rows-7 gap-[var(--dot-gap)]">
          {allDays.map((day, dayIndex) => {
            const dayString = format(day, 'yyyy-MM-dd');
            const isCompleted = completedDatesSet.has(dayString);
            const isBeforeCreation = isBefore(day, habitCreationDate);
            const isPast = isBefore(day, today);

            // Solo mostrar días desde la fecha de creación del hábito
            if (isBeforeCreation) {
              return null;
            }

            let dayBgClass = 'bg-gray-200/30'; // Color por defecto: suave

            // Si está completado, verde
            if (isCompleted) {
              dayBgClass = 'bg-green-500';
            } else if (isPast) {
              // Día pasado no completado - verificar si rompe la racha
              if (isWeekly) {
                // Lógica para hábitos semanales
                const weekStart = startOfWeek(day, { weekStartsOn: 1 });
                const weekEnd = endOfWeek(day, { weekStartsOn: 1 });
                const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
                
                const completionsInWeek = daysInWeek.reduce((count, weekDay) => {
                  return completedDatesSet.has(format(weekDay, 'yyyy-MM-dd')) ? count + 1 : count;
                }, 0);

                const daysLeft = differenceInDays(weekEnd, day) + 1;
                const completionsStillNeeded = (daysPerWeek || 1) - completionsInWeek;

                // Si es el último día posible para cumplir la meta semanal
                if (completionsStillNeeded === daysLeft) {
                  dayBgClass = 'bg-red-500'; // Último día posible - si no se completa aquí, rompe la racha
                }
              } else {
                // Lógica para hábitos diarios
                const previousDay = subDays(day, 1);
                const previousDayString = format(previousDay, 'yyyy-MM-dd');
                
                // Si el día anterior estaba completado (tenía racha) y este día no se completó
                if (completedDatesSet.has(previousDayString) && !isBefore(previousDay, habitCreationDate)) {
                  dayBgClass = 'bg-red-500'; // Rompe la racha diaria
                }
              }
            }

            // Calculate the correct grid position based on day of week
            // getDay() returns 0=Sunday, 1=Monday, ..., 6=Saturday
            // We want Monday=0, Tuesday=1, ..., Sunday=6 to match our weekDays array
            const dayOfWeek = getDay(day);
            const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6, others shift down by 1

            // Calculate which week column this day belongs to
            // We need to find how many weeks have passed since the start of the week when the habit was created
            const habitWeekStart = startOfWeek(habitCreationDate, { weekStartsOn: 1 });
            const dayWeekStart = startOfWeek(day, { weekStartsOn: 1 });
            const weeksSinceHabitCreation = Math.floor(differenceInDays(dayWeekStart, habitWeekStart) / 7);
            const weekColumn = weeksSinceHabitCreation + 1;

            return (
              <div
                key={`${habit.id}-${section}-day-${dayIndex}-${dayString}`}
                className={cn('w-[var(--dot-size)] h-[var(--dot-size)] rounded-[3px]', dayBgClass)}
                title={`${dayString} (${weekDays[adjustedDayOfWeek]})`}
                style={{
                  gridRow: adjustedDayOfWeek + 1,
                  gridColumn: weekColumn
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { HabitCompletionGrid };
