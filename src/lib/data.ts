import type { Habit, GratitudeEntry } from './types';
import { subDays, formatISO } from 'date-fns';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'gratitude-habit',
    name: 'Agradecer',
    icon: 'BookHeart',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completedDates: [],
  },
  {
    id: '1',
    name: 'Revisión de Presupuesto Semanal',
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

export const INITIAL_GRATITUDE_ENTRIES: GratitudeEntry[] = [
  {
    id: '1',
    date: formatISO(subDays(new Date(), 1), { representation: 'date' }),
    content: '1. The warm sun on my face during my morning walk.\n2. A delicious cup of coffee to start the day.\n3. A productive and focused work session.',
  },
  {
    id: '2',
    date: formatISO(subDays(new Date(), 3), { representation: 'date' }),
    content: '1. Finishing a great book.\n2. A long chat with an old friend.\n3. The beautiful sunset.',
  },
];
