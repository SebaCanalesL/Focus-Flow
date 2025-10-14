'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import React from "react";
import { Reminder } from "@/lib/types";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  reminder: Reminder;
  onUpdate: (reminder: Reminder) => void;
  onRemove: (reminderId: string) => void;
}

function ReminderCard({ reminder, onUpdate, onRemove }: ReminderCardProps) {
  const dayLabel = weekDays.find(d => d.value === reminder.day)?.label || reminder.day;

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
            <Switch
              checked={reminder.enabled}
              onCheckedChange={(enabled) => onUpdate({ ...reminder, enabled })}
            />
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
  reminders: Reminder[];
  onRemindersChange: (reminders: Reminder[]) => void;
}

export function RemindersSection({ reminders, onRemindersChange }: RemindersSectionProps) {
  const { toast } = useToast();
  
  const addReminder = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      day: 'L',
      time: '08:00',
      enabled: true,
    };
    
    // Check if a reminder with the same day and time already exists
    const isDuplicate = reminders.some(reminder => 
      reminder.day === newReminder.day && reminder.time === newReminder.time
    );
    
    if (isDuplicate) {
      toast({
        title: "Recordatorio duplicado",
        description: "Ya existe un recordatorio para este día y hora.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Adding new reminder:', newReminder);
    console.log('Current reminders:', reminders);
    onRemindersChange([...reminders, newReminder]);
  };

  const updateReminder = (updatedReminder: Reminder) => {
    console.log('Updating reminder:', updatedReminder);
    console.log('Current reminders before update:', reminders);
    
    // Check if updating would create a duplicate (excluding the current reminder being updated)
    const isDuplicate = reminders.some(reminder => 
      reminder.id !== updatedReminder.id && 
      reminder.day === updatedReminder.day && 
      reminder.time === updatedReminder.time
    );
    
    if (isDuplicate) {
      toast({
        title: "Recordatorio duplicado",
        description: "Ya existe un recordatorio para este día y hora.",
        variant: "destructive",
      });
      return;
    }
    
    const newReminders = reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r);
    console.log('New reminders after update:', newReminders);
    onRemindersChange(newReminders);
  };

  const removeReminder = (reminderId: string) => {
    onRemindersChange(reminders.filter(r => r.id !== reminderId));
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
          Agregar recordatorio
        </Button>
      </div>
      
      {reminders.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              No hay recordatorios configurados
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Agrega recordatorios para recibir notificaciones push
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onUpdate={updateReminder}
              onRemove={removeReminder}
            />
          ))}
        </div>
      )}
      
      {reminders.length > 0 && (
        <div className="text-xs text-muted-foreground">
          💡 Puedes agregar múltiples recordatorios para diferentes días y horarios
        </div>
      )}
    </div>
  );
}
