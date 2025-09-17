import type { Habit, GratitudeEntry } from './types';
import { subDays, formatISO } from 'date-fns';

export const INITIAL_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Read for 15 minutes',
    icon: 'BookOpen',
    color: '#60a5fa',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completedDates: [
      formatISO(subDays(new Date(), 1), { representation: 'date' }),
      formatISO(subDays(new Date(), 2), { representation: 'date' }),
      formatISO(subDays(new Date(), 3), { representation: 'date' }),
    ],
  },
  {
    id: '2',
    name: 'Go for a walk',
    icon: 'Footprints',
    color: '#4ade80',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completedDates: [
      formatISO(subDays(new Date(), 1), { representation: 'date' }),
    ],
  },
  {
    id: '3',
    name: 'Weekly review',
    icon: 'ClipboardCheck',
    color: '#facc15',
    frequency: 'weekly',
    daysPerWeek: 1,
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
