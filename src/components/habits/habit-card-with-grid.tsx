"use client";

import type { Habit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { Target, Flame, Check, CalendarDays, CheckCheck } from "lucide-react";
import { useAppData } from "@/contexts/app-provider";
import { cn } from "@/lib/utils";
import { HabitCompletionGrid } from "./habit-completion-grid";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "../ui/button";
import { useState } from "react";
import { formatISO } from "date-fns";

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  if (!LucideIcon) return <Target className={className} />;
  return <LucideIcon className={className} />;
};

export function HabitCardWithGrid({ habit }: { habit: Habit }) {
  const { toggleHabitCompletion, getStreak } = useAppData();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const today = new Date();
  const todayString = formatISO(today, { representation: "date" });
  const isCompletedToday = habit.completedDates.includes(todayString);
  const streak = getStreak(habit);

  const completedDatesForCalendar = habit.completedDates.map(d => new Date(d));

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      toggleHabitCompletion(habit.id, day);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Icon name={habit.icon as IconName} className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{habit.name}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Flame className={cn("h-4 w-4", streak > 0 ? "text-orange-500" : "text-muted-foreground")} />
                Racha: {streak} {streak === 1 ? "día" : "días"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarDays className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="multiple"
                  selected={completedDatesForCalendar}
                  onSelect={(days) => {
                    // This is a simplified way to handle multiple date toggling.
                    // A more robust solution would diff the arrays.
                    // For this implementation, we will just toggle the last selected day.
                    const lastDay = days?.[days.length -1];
                    handleDayClick(lastDay);
                  }}
                  modifiers={{
                    // This is to prevent calendar from showing "today" as selected by default
                    // We are handling the selection with the `selected` prop.
                     today: {
                      backgroundColor: 'transparent',
                      color: 'inherit',
                    }
                  }}
                  onDayClick={handleDayClick}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              size="icon"
              className={cn(isCompletedToday && "bg-green-600 hover:bg-green-700")}
              onClick={() => toggleHabitCompletion(habit.id, new Date())}
            >
              {isCompletedToday ? <CheckCheck className="h-5 w-5" /> : <Check className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        <HabitCompletionGrid completedDates={habit.completedDates} />
      </CardContent>
    </Card>
  );
}
