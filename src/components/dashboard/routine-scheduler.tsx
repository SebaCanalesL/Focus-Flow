'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";
import { Routine, RoutineSchedule } from "@/lib/types";
import { useAppData } from "@/contexts/app-provider";
import { PerformRoutineSheet } from "@/components/routines/perform-routine-sheet";

interface UpcomingRoutine {
  routine: Routine;
  schedule: {
    day: string;
    time: string;
  };
  isToday: boolean;
  isNow: boolean;
}

export function RoutineScheduler() {
  const { routines } = useAppData();
  
  // Función para obtener rutinas programadas para hoy
  const getTodayScheduledRoutines = (): UpcomingRoutine[] => {
    const today = new Date();
    const todayDay = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][today.getDay()];
    const currentTime = today.toTimeString().slice(0, 5); // 'HH:MM'
    
    const todayRoutines: UpcomingRoutine[] = [];
    
    routines.forEach(routine => {
      // Check both schedules (new) and reminders (legacy) for execution
      const schedules = routine.schedules || [];
      const reminders = routine.reminders || [];
      
      // Process new schedules
      schedules.forEach(schedule => {
        if (schedule.executionEnabled && schedule.day === todayDay) {
          const isNow = schedule.time === currentTime;
          todayRoutines.push({
            routine,
            schedule,
            isToday: true,
            isNow
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
            isNow
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
        {todayRoutines.map(({ routine, schedule, isNow }) => (
          <div 
            key={`${routine.id}-${schedule.time}`}
            className={`p-4 rounded-lg border ${
              isNow 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{routine.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {schedule.time}
                </div>
                {routine.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {routine.description}
                  </p>
                )}
              </div>
              <PerformRoutineSheet routine={routine}>
                <Button 
                  variant={isNow ? "default" : "outline"}
                  size="sm"
                >
                  {isNow ? "Comenzar Ahora" : "Iniciar"}
                </Button>
              </PerformRoutineSheet>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
