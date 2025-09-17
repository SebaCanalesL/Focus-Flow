"use client";

import type { Habit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { Target, Flame, Check, CalendarDays, CheckCheck, Pencil, GripVertical } from "lucide-react";
import { useAppData } from "@/contexts/app-provider";
import { cn } from "@/lib/utils";
import { HabitCompletionGrid } from "./habit-completion-grid";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "../ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { EditHabitDialog } from "./edit-habit-dialog";

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};

export function HabitCardWithGrid({ 
    habit, 
    isDragging,
    style,
    ...props
}: { 
    habit: Habit, 
    isDragging?: boolean, 
    style?: React.CSSProperties, 
    [key: string]: any 
}) {
  const { toggleHabitCompletion, getStreak, getWeekCompletion } = useAppData();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const today = new Date();
  const todayString = format(today, "yyyy-MM-dd");
  const isCompletedToday = habit.completedDates.includes(todayString);
  const streak = getStreak(habit);

  const completedDatesForCalendar = habit.completedDates.map(d => {
      const [year, month, day] = d.split('-').map(Number);
      return new Date(year, month - 1, day);
  });

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      toggleHabitCompletion(habit.id, day);
    }
  };
  
  const weekCompletion = getWeekCompletion(habit);
  const isWeekly = habit.frequency === 'weekly';
  const streakUnit = isWeekly ? (streak === 1 ? "semana" : "semanas") : (streak === 1 ? "día" : "días");

  return (
    <Card 
        className={cn("flex flex-col transition-shadow", isDragging && "shadow-2xl")}
        style={style}
        {...props}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             {habit.id !== 'gratitude-habit' && (
              <button {...props.listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-6 w-6 text-muted-foreground" />
              </button>
            )}
            <div className={cn("p-2 rounded-lg bg-primary/20", habit.id === 'gratitude-habit' && 'ml-12')}>
              <Icon name={habit.icon as IconName} className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{habit.name}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {habit.id !== 'gratitude-habit' && (
                <EditHabitDialog habit={habit}>
                    <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-auto md:px-4">
                        <Pencil className="h-5 w-5 md:mr-2" />
                        <span className="hidden md:inline">Editar</span>
                    </Button>
                </EditHabitDialog>
            )}

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-auto md:px-4">
                  <CalendarDays className="h-5 w-5 md:mr-2" />
                   <span className="hidden md:inline">Ver</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="multiple"
                  selected={completedDatesForCalendar}
                  onDayClick={handleDayClick}
                  initialFocus
                  weekStartsOn={1}
                />
              </PopoverContent>
            </Popover>
            <Button
              size="icon"
              className={cn("h-9 w-9 md:h-10 md:w-10", isCompletedToday && "bg-primary text-white hover:bg-primary/90")}
              variant={isCompletedToday ? "default" : "outline"}
              onClick={() => toggleHabitCompletion(habit.id, new Date())}
            >
              {isCompletedToday ? <CheckCheck className="h-5 w-5" /> : <Check className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-end justify-between gap-4">
        <HabitCompletionGrid habit={habit} />
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/50 shrink-0">
            <div className="flex items-center gap-2 text-2xl font-bold">
                 <Flame className={cn("h-7 w-7", streak > 0 ? "text-orange-500" : "text-muted-foreground")} />
                 <span>{streak}</span>
            </div>
            <p className="text-sm text-muted-foreground">{streakUnit}</p>
             {isWeekly && (
                <p className="text-xs font-medium text-muted-foreground mt-2">({weekCompletion.completed}/{weekCompletion.total} esta semana)</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
