export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: Frequency;
  daysPerWeek?: number; // Target days per week for weekly habits
  createdAt: string;
  completedDates: string[]; // Store dates as ISO strings 'YYYY-MM-DD'
  reminderEnabled?: boolean;
  reminderTime?: string; // e.g., "09:00"
  order?: number; // For drag and drop ordering
}

export interface GratitudeEntry {
  id: string;
  date: string; // ISO string 'YYYY-MM-DD'
  content: string;
  note?: string;
}
