import type { Timestamp } from 'firebase/firestore';

export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color?: string; // Color for the habit
  frequency: Frequency;
  daysPerWeek?: number; // Target days per week for weekly habits
  createdAt: string;
  completedDates: string[]; // Store dates as ISO strings 'YYYY-MM-DD'
  reminderEnabled?: boolean; // Deprecated: use reminders array instead
  reminderTime?: string; // Deprecated: use reminders array instead
  reminders?: Reminder[]; // New: array of reminders like in routines
  order?: number; // For drag and drop ordering
}

export interface GratitudeEntry {
  id: string;
  dateKey: string; // ISO string 'YYYY-MM-DD' in 'America/Santiago' timezone
  date?: string; // Alternative date field for compatibility
  content: string;
  note?: string;
  motivation?: string;
  createdAt?: Timestamp;
}

export interface UserProfile {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
}

export interface CustomStep {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  isCustom: true;
}

export interface Reminder {
  id: string;
  day: string; // 'L', 'M', 'X', 'J', 'V', 'S', 'D'
  time: string; // 'HH:MM' format
  enabled: boolean;
}

export interface RoutineSchedule {
  id: string;
  day: string; // 'L', 'M', 'X', 'J', 'V', 'S', 'D'
  time: string; // 'HH:MM' format
  notificationEnabled: boolean; // Para notificaciones push
  executionEnabled: boolean; // Para indicar si se ejecutará en este día/hora
}

export interface Routine {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  stepIds?: string[];
  stepOrder?: string[]; // Orden de los pasos seleccionados
  customSteps?: CustomStep[];
  reminders?: Reminder[]; // Mantener para compatibilidad con datos existentes
  schedules?: RoutineSchedule[]; // Nueva estructura para días de ejecución y notificaciones
  frequency?: string;
  days?: string[];
  completedDates?: string[]; // Fechas cuando la rutina fue completada (formato 'YYYY-MM-DD')
  lastCompletedAt?: string; // Fecha y hora de la última vez que se completó (formato ISO)
  createdAt?: string;
  updatedAt?: string;
}
