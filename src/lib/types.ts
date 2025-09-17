export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: Frequency;
  createdAt: string;
  completedDates: string[]; // Store dates as ISO strings 'YYYY-MM-DD'
}

export interface GratitudeEntry {
  id: string;
  date: string; // ISO string 'YYYY-MM-DD'
  content: string;
}
