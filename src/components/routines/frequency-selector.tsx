'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Bell, BellOff } from "lucide-react";
import { RoutineSchedule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { generateScheduleSummary } from "@/lib/schedule-utils";

// Function to generate unique IDs
function generateUniqueId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `schedule-${timestamp}-${random}`;
}

export type FrequencyType = 'daily' | 'weekdays' | 'weekends';

export interface FrequencyConfig {
  type: FrequencyType | null; // null when no preset matches
  selectedDays: string[]; // ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  time: string; // 'HH:MM'
  sameTimeForAllDays: boolean; // new field for same time checkbox
  customTimes: Record<string, string>; // custom times per day when sameTimeForAllDays is false
  notificationsEnabled: boolean;
  notificationAdvance: number; // minutes before
}

const weekDays = [
  { value: 'L', label: 'L', fullLabel: 'Lunes' },
  { value: 'M', label: 'M', fullLabel: 'Martes' },
  { value: 'X', label: 'X', fullLabel: 'Miércoles' },
  { value: 'J', label: 'J', fullLabel: 'Jueves' },
  { value: 'V', label: 'V', fullLabel: 'Viernes' },
  { value: 'S', label: 'S', fullLabel: 'Sábado' },
  { value: 'D', label: 'D', fullLabel: 'Domingo' },
];

const frequencyOptions = [
  {
    value: 'daily' as FrequencyType,
    label: '🗓️ Todos los días',
    days: ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  },
  {
    value: 'weekdays' as FrequencyType,
    label: '☀️ Días de semana',
    days: ['L', 'M', 'X', 'J', 'V']
  },
  {
    value: 'weekends' as FrequencyType,
    label: '🌙 Fin de semana',
    days: ['S', 'D']
  }
];

const notificationAdvanceOptions = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' }
];

// Generate time options (every 15 minutes)
const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const displayTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return { value: timeString, label: displayTime };
});

interface FrequencySelectorProps {
  schedules?: RoutineSchedule[];
  onSchedulesChange: (schedules: RoutineSchedule[]) => void;
  initialConfig?: Partial<FrequencyConfig>;
}

export function FrequencySelector({ schedules = [], onSchedulesChange, initialConfig }: FrequencySelectorProps) {
  const [config, setConfig] = useState<FrequencyConfig>({
    type: 'weekdays',
    selectedDays: ['L', 'M', 'X', 'J', 'V'],
    time: '08:00',
    sameTimeForAllDays: true,
    customTimes: {},
    notificationsEnabled: true,
    notificationAdvance: 10,
    ...initialConfig
  });


  // Initialize config from existing schedules only once
  useEffect(() => {
    if (schedules.length > 0) {
      const days = schedules.map(s => s.day);
      const times = schedules.map(s => s.time);
      const notificationsEnabled = schedules[0]?.notificationEnabled || false;

      // Check if all schedules have the same time
      const allSameTime = times.every(time => time === times[0]);
      const customTimes: Record<string, string> = {};
      
      if (!allSameTime) {
        schedules.forEach(schedule => {
          customTimes[schedule.day] = schedule.time;
        });
      }

      // Determine frequency type based on selected days
      let type: FrequencyType | null = null;
      if (days.length === 7) {
        type = 'daily';
      } else if (days.length === 5 && !days.includes('S') && !days.includes('D')) {
        type = 'weekdays';
      } else if (days.length === 2 && days.includes('S') && days.includes('D')) {
        type = 'weekends';
      }

      setConfig({
        type,
        selectedDays: days,
        time: times[0] || '08:00',
        sameTimeForAllDays: allSameTime,
        customTimes,
        notificationsEnabled,
        notificationAdvance: 10,
      });
    }
  }, []); // Only run on mount

  // Update schedules when config changes
  useEffect(() => {
    if (config.selectedDays.length === 0) return;

    const newSchedules: RoutineSchedule[] = config.selectedDays.map(day => ({
      id: generateUniqueId(),
      day,
      time: config.sameTimeForAllDays ? config.time : (config.customTimes[day] || config.time),
      notificationEnabled: config.notificationsEnabled,
      executionEnabled: true,
    }));

    onSchedulesChange(newSchedules);
  }, [config.selectedDays, config.time, config.sameTimeForAllDays, config.customTimes, config.notificationsEnabled, onSchedulesChange]);

  const handleFrequencyChange = (type: FrequencyType) => {
    const option = frequencyOptions.find(opt => opt.value === type);
    setConfig(prev => ({
      ...prev,
      type,
      selectedDays: option?.days || prev.selectedDays
    }));
  };

  const toggleDay = (day: string) => {
    setConfig(prev => {
      const newSelectedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day];
      
      // Ensure at least one day is selected
      if (newSelectedDays.length === 0) {
        return prev; // Don't update if no days would be selected
      }
      
      // Check if the new selection matches any preset
      let newType: FrequencyType | null = null;
      if (newSelectedDays.length === 7) {
        newType = 'daily';
      } else if (newSelectedDays.length === 5 && !newSelectedDays.includes('S') && !newSelectedDays.includes('D')) {
        newType = 'weekdays';
      } else if (newSelectedDays.length === 2 && newSelectedDays.includes('S') && newSelectedDays.includes('D')) {
        newType = 'weekends';
      }
      
      return {
        ...prev,
        type: newType, // Set to null if no preset matches
        selectedDays: newSelectedDays
      };
    });
  };

  const formatSelectedDays = (days: string[]) => {
    if (days.length === 0) return 'Ningún día';
    if (days.length === 7) return 'Todos los días';
    
    const dayLabels = days.map(day => {
      const dayInfo = weekDays.find(d => d.value === day);
      return dayInfo?.fullLabel;
    }).filter(Boolean);

    if (days.length <= 2) {
      return dayLabels.join(' y ');
    } else {
      const lastDay = dayLabels.pop();
      return `${dayLabels.join(', ')} y ${lastDay}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de frecuencia predefinida */}
      <div className="space-y-3">
        <Label className="text-base font-medium">¿Con qué frecuencia quieres hacer esta rutina?</Label>
        <div className="grid grid-cols-3 gap-2">
          {frequencyOptions.map((option) => (
            <Button
              key={option.value}
              variant={config.type === option.value ? "default" : "outline"}
              className={cn(
                "h-auto p-3 flex flex-col items-center gap-1 text-center",
                config.type === option.value && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleFrequencyChange(option.value)}
            >
              <span className="font-medium text-sm">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Selector de días - siempre visible */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Selecciona los días</Label>
        <div className="flex gap-2 flex-wrap">
          {weekDays.map((day) => (
            <Button
              key={day.value}
              variant={config.selectedDays.includes(day.value) ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-10 h-10 p-0 font-semibold transition-all",
                config.selectedDays.includes(day.value) 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted"
              )}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </Button>
          ))}
        </div>
        {config.selectedDays.length === 0 && (
          <p className="text-sm text-muted-foreground">
            ⚠️ Selecciona al menos un día para tu rutina
          </p>
        )}
      </div>

      {/* Selector de hora */}
      <div className="space-y-3">
        <Label className="text-base font-medium">¿A qué hora?</Label>
        
        {/* Checkbox para mismo horario */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="same-time" 
            checked={config.sameTimeForAllDays}
            onCheckedChange={(checked) => setConfig(prev => ({ 
              ...prev, 
              sameTimeForAllDays: checked as boolean,
              customTimes: checked ? {} : prev.customTimes // Clear custom times when enabling same time
            }))}
          />
          <Label htmlFor="same-time" className="text-sm font-normal">
            Todos los días a la misma hora
          </Label>
        </div>

        {config.sameTimeForAllDays ? (
          /* Horario único para todos los días */
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Select value={config.time} onValueChange={(time) => setConfig(prev => ({ ...prev, time }))}>
              <SelectTrigger className="w-32">
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
        ) : (
          /* Horarios personalizados por día */
          <div className="space-y-3">
            {config.selectedDays.map((day) => {
              const dayInfo = weekDays.find(d => d.value === day);
              return (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-16 text-sm font-medium">
                    {dayInfo?.fullLabel}
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={config.customTimes[day] || config.time} 
                    onValueChange={(time) => setConfig(prev => ({ 
                      ...prev, 
                      customTimes: { ...prev.customTimes, [day]: time }
                    }))}
                  >
                    <SelectTrigger className="w-32">
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
              );
            })}
          </div>
        )}
      </div>

      {/* Configuración de notificaciones */}
      <Card className="border-muted-foreground/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Recordatorios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">¿Quieres recibir recordatorios?</Label>
              <p className="text-xs text-muted-foreground">
                Te notificaremos antes de que sea hora de hacer tu rutina
              </p>
            </div>
            <Switch
              checked={config.notificationsEnabled}
              onCheckedChange={(enabled) => setConfig(prev => ({ ...prev, notificationsEnabled: enabled }))}
            />
          </div>

          {config.notificationsEnabled && (
            <div className="space-y-2">
              <Label className="text-sm">¿Con cuánto tiempo de anticipación?</Label>
              <Select 
                value={config.notificationAdvance.toString()} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, notificationAdvance: parseInt(value) }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationAdvanceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen visual */}
      <Card className={cn(
        "border-2 transition-all",
        config.selectedDays.length > 0 
          ? "bg-primary/5 border-primary/30 shadow-sm" 
          : "bg-muted/30 border-muted-foreground/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              config.selectedDays.length > 0 
                ? "bg-primary/10" 
                : "bg-muted"
            )}>
              {config.selectedDays.length > 0 ? (
                <Calendar className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              {config.selectedDays.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      🕗 {(() => {
                        // Generar schedules temporales para el resumen
                        const tempSchedules = config.selectedDays.map(day => ({
                          id: `temp-${day}`,
                          day,
                          time: config.sameTimeForAllDays ? config.time : (config.customTimes[day] || config.time),
                          notificationEnabled: config.notificationsEnabled,
                          executionEnabled: true
                        }));
                        return generateScheduleSummary(tempSchedules);
                      })()}
                    </Badge>
                    {config.notificationsEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        🔔 {config.notificationAdvance} min antes
                      </Badge>
                    )}
                  </div>
                  {!config.notificationsEnabled && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Sin recordatorios
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Selecciona los días para ver el resumen de tu rutina
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
