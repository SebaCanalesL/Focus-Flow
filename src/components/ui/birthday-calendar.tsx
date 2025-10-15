'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BirthdayCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const BirthdayCalendar = ({ 
  selected, 
  onSelect, 
  className 
}: BirthdayCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  
  const isSelected = (day: Date) => {
    return selected && isSameDay(day, selected);
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

  const handlePreviousYear = () => {
    setCurrentMonth(subYears(currentMonth, 1));
  };

  const handleNextYear = () => {
    setCurrentMonth(addYears(currentMonth, 1));
  };

  const handleMonthChange = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
  };

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();
  const currentYearRange = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);

  const handleDateClick = (day: Date) => {
    if (onSelect) {
      onSelect(day);
    }
  };

  return (
    <div className={cn("w-80 bg-background border rounded-lg p-4", className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousYear}
            className="h-7 w-7 p-0"
          >
            <ChevronsLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={currentMonthIndex.toString()} onValueChange={(value) => handleMonthChange(parseInt(value))}>
            <SelectTrigger className="w-28 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentYear.toString()} onValueChange={(value) => handleYearChange(parseInt(value))}>
            <SelectTrigger className="w-20 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {currentYearRange.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextYear}
            className="h-7 w-7 p-0"
          >
            <ChevronsRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const selected = isSelected(day);
          const today = isToday(day);
          const currentMonth = isCurrentMonth(day);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={cn(
                "h-9 w-9 text-sm rounded-md transition-colors font-medium",
                !currentMonth && "text-muted-foreground opacity-50",
                today && !selected && "bg-accent text-accent-foreground font-semibold",
                selected && "bg-primary text-primary-foreground font-bold",
                !selected && !today && "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

    </div>
  );
};
