import type { Habit, GratitudeEntry } from './types';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'gratitude-habit',
    name: 'Agradecer 3 aspectos de mi vida',
    icon: 'BookHeart',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completedDates: [],
    order: -1, // Pinned to top
  },
  {
    id: '1',
    name: 'Revisión de gastos semanal',
    icon: 'PiggyBank',
    frequency: 'weekly',
    daysPerWeek: 1,
    createdAt: new Date().toISOString(),
    completedDates: [],
    order: 0,
  },
  {
    id: '2',
    name: 'Leer 10 páginas',
    icon: 'BookOpen',
    frequency: 'weekly',
    daysPerWeek: 4,
    createdAt: new Date().toISOString(),
    completedDates: [],
    order: 1,
  },
];

export const INITIAL_GRATITUDE_ENTRIES: GratitudeEntry[] = [];
