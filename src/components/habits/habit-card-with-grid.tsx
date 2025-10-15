'use client';

import type { Habit } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import {
  Target,
  Flame,
  Check,
  CalendarDays,
  CheckCheck,
  Pencil,
  GripVertical,
} from 'lucide-react';
import { useAppData } from '@/contexts/app-provider';
import { cn } from '@/lib/utils';
import { HabitCompletionGrid } from './habit-completion-grid';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { Button } from '../ui/button';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { EditHabitDialog } from './edit-habit-dialog';

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon =
    LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};

export function HabitCardWithGrid({
  habit,
  isDragging,
  style,
  listeners,
  section = 'default',
}: {
  habit: Habit;
  isDragging?: boolean;
  style?: React.CSSProperties;
  listeners?: React.HTMLAttributes<HTMLDivElement>;
  section?: string;
}) {
  const { toggleHabitCompletion, getStreak, getWeekCompletion } = useAppData();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');
  const isCompletedToday = habit.completedDates.includes(todayString);
  const streak = getStreak(habit);

  const completedDatesAsDates = habit.completedDates.map(isoString => parseISO(isoString));

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      toggleHabitCompletion(habit.id, day);
    }
  };

  const weekCompletion = getWeekCompletion(habit);
  const isWeekly = habit.frequency === 'weekly';
  const streakUnit = isWeekly
    ? streak === 1
      ? 'semana'
      : 'semanas'
    : streak === 1
    ? 'día'
    : 'días';

  return (
    <Card
      className={cn('flex flex-col transition-shadow', isDragging && 'shadow-2xl')}
      style={style}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div {...listeners} className="touch-none cursor-grab py-2">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className={'p-2 rounded-lg bg-primary/20'}>
              <Icon name={habit.icon as IconName} className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{habit.name}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <EditHabitDialog habit={habit}>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Editar</span>
              </Button>
            </EditHabitDialog>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Ver</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CustomCalendar
                  selectedDates={completedDatesAsDates}
                  onDateClick={handleDayClick}
                  habitColor={habit.color || '#10b981'}
                />
              </PopoverContent>
            </Popover>
            <Button
              size="icon"
              className={cn('h-8 w-8 sm:h-9 sm:w-9', isCompletedToday && 'bg-green-600 text-white hover:bg-green-600/90')}
              variant={isCompletedToday ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                toggleHabitCompletion(habit.id, new Date());
              }}
            >
              {isCompletedToday ? (
                <CheckCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-end justify-between gap-4">
        <HabitCompletionGrid habit={habit} section={section} />
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg bg-secondary/50 shrink-0">
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
            <Flame
              className={cn(
                'h-6 w-6 sm:h-7 sm:w-7',
                streak > 0 ? 'text-orange-500' : 'text-muted-foreground'
              )}
            />
            <span>{streak}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{streakUnit}</p>
          {isWeekly && (
            <p className="text-xs font-medium text-muted-foreground mt-1 sm:mt-2">
              ({weekCompletion.completed}/{weekCompletion.total} esta semana)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
