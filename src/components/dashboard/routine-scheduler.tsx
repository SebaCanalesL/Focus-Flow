'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Play, RotateCcw } from "lucide-react";
import { Routine } from "@/lib/types";
import { useAppData } from "@/contexts/app-provider";
import { PerformRoutineSheet } from "@/components/routines/perform-routine-sheet";
import { format } from "date-fns";

interface UpcomingRoutine {
  routine: Routine;
  schedule: {
    day: string;
    time: string;
  };
  isToday: boolean;
  isNow: boolean;
  isCompleted: boolean;
}

export function RoutineScheduler() {
  const { routines, toggleRoutineCompletion } = useAppData();
  
  // Función para obtener rutinas programadas para hoy
  const getTodayScheduledRoutines = (): UpcomingRoutine[] => {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    const todayDay = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][today.getDay()];
    const currentTime = today.toTimeString().slice(0, 5); // 'HH:MM'
    
    const todayRoutines: UpcomingRoutine[] = [];
    
    routines.forEach(routine => {
      // Check both schedules (new) and reminders (legacy) for execution
      const schedules = routine.schedules || [];
      const reminders = routine.reminders || [];
      const completedDates = routine.completedDates || [];
      const isCompleted = completedDates.includes(todayString);
      
      // Process new schedules
      schedules.forEach(schedule => {
        if (schedule.executionEnabled && schedule.day === todayDay) {
          const isNow = schedule.time === currentTime;
          todayRoutines.push({
            routine,
            schedule,
            isToday: true,
            isNow,
            isCompleted
          });
        }
      });
      
      // Process legacy reminders (for backward compatibility)
      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.day === todayDay) {
          const isNow = reminder.time === currentTime;
          todayRoutines.push({
            routine,
            schedule: {
              day: reminder.day,
              time: reminder.time
            },
            isToday: true,
            isNow,
            isCompleted
          });
        }
      });
    });
    
    // Ordenar por hora
    return todayRoutines.sort((a, b) => a.schedule.time.localeCompare(b.schedule.time));
  };
  
  const todayRoutines = getTodayScheduledRoutines();
  
  if (todayRoutines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rutinas Programadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No tienes rutinas programadas para hoy.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Ve a la sección de Rutinas para programar tus rutinas diarias.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Rutinas de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayRoutines.map(({ routine, schedule, isNow, isCompleted }) => (
          <div 
            key={`${routine.id}-${schedule.time}`}
            className={`p-4 rounded-lg border ${
              isCompleted 
                ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-950/30' 
                : isNow 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{routine.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {schedule.time}
                </div>
              </div>
              <div className="flex-shrink-0">
                <PerformRoutineSheet 
                  routine={routine}
                  onComplete={() => toggleRoutineCompletion(routine.id)}
                >
                  <Button 
                    variant={isCompleted ? "outline" : isNow ? "default" : "outline"}
                    size={isCompleted || !isNow ? "icon" : "sm"}
                    className={isNow ? "whitespace-nowrap" : ""}
                    title={isCompleted ? "Iniciar nuevamente" : isNow ? "Comenzar Ahora" : "Iniciar"}
                  >
                    {isCompleted ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : isNow ? (
                      "Comenzar Ahora"
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </PerformRoutineSheet>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
