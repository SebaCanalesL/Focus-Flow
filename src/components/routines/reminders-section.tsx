'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import React from "react";
import { Reminder, RoutineSchedule } from "@/lib/types";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Function to generate unique IDs
function generateUniqueId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `reminder-${timestamp}-${random}`;
}

const weekDays = [
  { value: 'L', label: 'Lunes' },
  { value: 'M', label: 'Martes' },
  { value: 'X', label: 'Miércoles' },
  { value: 'J', label: 'Jueves' },
  { value: 'V', label: 'Viernes' },
  { value: 'S', label: 'Sábado' },
  { value: 'D', label: 'Domingo' },
];

// Generate time options (every 15 minutes)
const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const displayTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return { value: timeString, label: displayTime };
});

interface ReminderCardProps {
  reminder: Reminder | RoutineSchedule;
  onUpdate: (reminder: Reminder | RoutineSchedule) => void;
  onRemove: (reminderId: string) => void;
}

function ReminderCard({ reminder, onUpdate, onRemove }: ReminderCardProps) {
  const isSchedule = 'executionEnabled' in reminder;

  return (
    <Card className="border-muted-foreground/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select
                value={reminder.day}
                onValueChange={(day) => onUpdate({ ...reminder, day })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select
                value={reminder.time}
                onValueChange={(time) => onUpdate({ ...reminder, time })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isSchedule ? (
              <>
                <div className="flex flex-col items-center gap-1">
                  <Label className="text-xs">Ejecutar</Label>
                  <Switch
                    checked={reminder.executionEnabled}
                    onCheckedChange={(executionEnabled) => onUpdate({ ...reminder, executionEnabled })}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Label className="text-xs">Notificar</Label>
                  <Switch
                    checked={reminder.notificationEnabled}
                    onCheckedChange={(notificationEnabled) => onUpdate({ ...reminder, notificationEnabled })}
                  />
                </div>
              </>
            ) : (
              <Switch
                checked={reminder.enabled}
                onCheckedChange={(enabled) => onUpdate({ ...reminder, enabled })}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(reminder.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RemindersSectionProps {
  reminders?: Reminder[];
  schedules?: RoutineSchedule[];
  onRemindersChange?: (reminders: Reminder[]) => void;
  onSchedulesChange?: (schedules: RoutineSchedule[]) => void;
}

export function RemindersSection({ reminders = [], schedules = [], onRemindersChange, onSchedulesChange }: RemindersSectionProps) {
  const { toast } = useToast();
  
  // Determine if we're using schedules or reminders
  const isUsingSchedules = schedules.length > 0 || (schedules.length === 0 && reminders.length === 0 && onSchedulesChange);
  const currentItems = isUsingSchedules ? schedules : reminders;
  const onChangeHandler = isUsingSchedules ? onSchedulesChange : onRemindersChange;
  
  const addReminder = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Find a unique day and time combination
    const findUniqueReminder = () => {
      const defaultDay = 'L';
      const defaultTime = '08:00';
      
      // First try with default values
      const newItem = isUsingSchedules ? {
        id: generateUniqueId(),
        day: defaultDay,
        time: defaultTime,
        notificationEnabled: true,
        executionEnabled: true,
      } as RoutineSchedule : {
        id: generateUniqueId(),
        day: defaultDay,
        time: defaultTime,
        enabled: true,
      } as Reminder;
      
      // Check if default combination is already used
      const isDefaultDuplicate = currentItems.some(item => 
        item.day === newItem.day && item.time === newItem.time
      );
      
      if (!isDefaultDuplicate) {
        return newItem;
      }
      
      // If default is duplicate, try to find a unique time for the same day
      const existingTimesForDay = currentItems
        .filter(item => item.day === defaultDay)
        .map(item => item.time);
      
      // Try different times for the same day
      for (let hour = 7; hour <= 22; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          if (!existingTimesForDay.includes(timeString)) {
            return isUsingSchedules ? {
              id: generateUniqueId(),
              day: defaultDay,
              time: timeString,
              notificationEnabled: true,
              executionEnabled: true,
            } as RoutineSchedule : {
              id: generateUniqueId(),
              day: defaultDay,
              time: timeString,
              enabled: true,
            } as Reminder;
          }
        }
      }
      
      // If no unique time found for default day, try different days
      for (const dayOption of weekDays) {
        for (let hour = 7; hour <= 22; hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isDuplicate = currentItems.some(item => 
              item.day === dayOption.value && item.time === timeString
            );
            if (!isDuplicate) {
              return isUsingSchedules ? {
                id: generateUniqueId(),
                day: dayOption.value,
                time: timeString,
                notificationEnabled: true,
                executionEnabled: true,
              } as RoutineSchedule : {
                id: generateUniqueId(),
                day: dayOption.value,
                time: timeString,
                enabled: true,
              } as Reminder;
            }
          }
        }
      }
      
      // Fallback: return default (shouldn't happen in normal usage)
      return newItem;
    };
    
    const newItem = findUniqueReminder();
    
    console.log('Adding new item:', newItem);
    console.log('Current items:', currentItems);
    if (onChangeHandler) {
      if (isUsingSchedules) {
        (onChangeHandler as (schedules: RoutineSchedule[]) => void)([...currentItems, newItem] as RoutineSchedule[]);
      } else {
        (onChangeHandler as (reminders: Reminder[]) => void)([...currentItems, newItem] as Reminder[]);
      }
    }
  };

  const updateReminder = (updatedItem: Reminder | RoutineSchedule) => {
    console.log('Updating item:', updatedItem);
    console.log('Current items before update:', currentItems);
    
    // Check if updating would create a duplicate (excluding the current item being updated)
    const isDuplicate = currentItems.some(item => 
      item.id !== updatedItem.id && 
      item.day === updatedItem.day && 
      item.time === updatedItem.time
    );
    
    if (isDuplicate) {
      toast({
        title: "Horario duplicado",
        description: "Ya existe un horario para este día y hora.",
        variant: "destructive",
      });
      return;
    }
    
    const newItems = currentItems.map(item => item.id === updatedItem.id ? updatedItem : item);
    console.log('New items after update:', newItems);
    if (onChangeHandler) {
      if (isUsingSchedules) {
        (onChangeHandler as (schedules: RoutineSchedule[]) => void)(newItems as RoutineSchedule[]);
      } else {
        (onChangeHandler as (reminders: Reminder[]) => void)(newItems as Reminder[]);
      }
    }
  };

  const removeReminder = (itemId: string) => {
    if (onChangeHandler) {
      if (isUsingSchedules) {
        (onChangeHandler as (schedules: RoutineSchedule[]) => void)(currentItems.filter(item => item.id !== itemId) as RoutineSchedule[]);
      } else {
        (onChangeHandler as (reminders: Reminder[]) => void)(currentItems.filter(item => item.id !== itemId) as Reminder[]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">¿Cuándo quieres realizar esta rutina?</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addReminder}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar horario
        </Button>
      </div>
      
      {currentItems.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              No hay horarios configurados
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Agrega horarios para programar cuándo realizar esta rutina
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {currentItems.map((item) => (
            <ReminderCard
              key={item.id}
              reminder={item}
              onUpdate={updateReminder}
              onRemove={removeReminder}
            />
          ))}
        </div>
      )}
      
      {currentItems.length > 0 && (
        <div className="text-xs text-muted-foreground">
          💡 Puedes agregar múltiples horarios para diferentes días y horas
        </div>
      )}
    </div>
  );
}
