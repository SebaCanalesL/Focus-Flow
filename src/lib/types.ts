import type { Timestamp } from 'firebase/firestore';

export type Frequency = 'daily' | 'weekly';

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
  dateKey: string; // ISO string 'YYYY-MM-DD' in 'America/Santiago' timezone
  content: string;
  note?: string;
  createdAt?: Timestamp;
}

export interface UserProfile {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
}
