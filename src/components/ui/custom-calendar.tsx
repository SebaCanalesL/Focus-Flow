'use client';

import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomCalendarProps {
  selectedDates: Date[];
  onDateClick: (date: Date) => void;
  habitColor?: string;
  className?: string;
  highlightedDates?: Date[];
  highlightColor?: string;
  mode?: 'single' | 'multiple';
  fullWidth?: boolean;
}

export const CustomCalendar = ({ 
  selectedDates, 
  onDateClick, 
  habitColor = '#10b981',
  className,
  highlightedDates = [],
  highlightColor = '#3b82f6',
  fullWidth = false
}: CustomCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  
  const isSelected = (day: Date) => {
    return selectedDates.some(date => isSameDay(date, day));
  };
  
  const isHighlighted = (day: Date) => {
    return highlightedDates.some(date => isSameDay(date, day));
  };
  
  const isToday = (day: Date) => {
    return isSameDay(day, new Date());
  };
  
  const isCurrentMonth = (day: Date) => {
    return isSameMonth(day, currentMonth);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className={cn(
      fullWidth 
        ? "w-full bg-background border rounded-lg p-0" 
        : "w-80 bg-background border rounded-lg p-4", 
      className
    )}>
      {/* Header */}
      <div className={cn("flex items-center justify-between", fullWidth ? "p-4 pb-2" : "mb-4")}>
        <button 
          onClick={handlePreviousMonth}
          className="p-1 hover:bg-accent rounded transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-sm">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button 
          onClick={handleNextMonth}
          className="p-1 hover:bg-accent rounded transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Days of week */}
      <div className={cn("grid grid-cols-7 gap-1", fullWidth ? "px-4 pb-2" : "mb-2")}>
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className={cn("grid grid-cols-7 gap-1", fullWidth ? "px-4 pb-4" : "")}>
        {days.map((day, index) => {
          const selected = isSelected(day);
          const highlighted = isHighlighted(day);
          const today = isToday(day);
          const currentMonth = isCurrentMonth(day);
          
          // Determinar el color de fondo
          let backgroundColor = undefined;
          if (selected) {
            backgroundColor = habitColor;
          } else if (highlighted && !selected) {
            backgroundColor = highlightColor;
          }
          
          return (
            <button
              key={index}
              onClick={() => onDateClick(day)}
              className={cn(
                "h-9 w-9 text-sm rounded-md transition-colors font-medium",
                !currentMonth && "text-muted-foreground opacity-50",
                today && !selected && !highlighted && "bg-accent text-accent-foreground font-semibold",
                selected && "text-white font-bold",
                highlighted && !selected && "text-white font-medium",
                !selected && !highlighted && !today && "hover:bg-accent hover:text-accent-foreground"
              )}
              style={{
                backgroundColor
              }}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
