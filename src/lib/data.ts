import type { Habit, GratitudeEntry } from './types';
import { subDays, formatISO } from 'date-fns';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'gratitude-habit',
    name: 'Agradecer 3 aspectos de mi vida',
    icon: 'BookHeart',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completedDates: [],
  },
  {
    id: '1',
    name: 'Revisión de gastos semanal',
    icon: 'PiggyBank',
    frequency: 'weekly',
    daysPerWeek: 1,
    createdAt: new Date().toISOString(),
    completedDates: [],
  },
  {
    id: '2',
    name: 'Leer 10 páginas',
    icon: 'BookOpen',
    frequency: 'weekly',
    daysPerWeek: 4,
    createdAt: new Date().toISOString(),
    completedDates: [],
  },
];

export const INITIAL_GRATITUDE_ENTRIES: GratitudeEntry[] = [];
