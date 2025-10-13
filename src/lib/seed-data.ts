import type { Habit, GratitudeEntry } from './types';
import { subDays, formatISO, addDays } from 'date-fns';

// Usuario de prueba para desarrollo
export const DEV_USER = {
  uid: 'dev-user-123',
  email: 'dev@focusflow.com',
  displayName: 'Usuario de Desarrollo',
  photoURL: null,
};

// Hábitos de ejemplo con datos realistas
export const SEED_HABITS: Habit[] = [
  {
    id: 'gratitude-habit',
    name: 'Agradecer 3 aspectos de mi vida',
    icon: 'BookHeart',
    frequency: 'daily',
    createdAt: subDays(new Date(), 30).toISOString(),
    completedDates: generateCompletedDates(subDays(new Date(), 30), 25), // 25 de 30 días
    reminderEnabled: true,
    reminderTime: '20:00',
    order: 1,
  },
  {
    id: 'exercise-habit',
    name: 'Ejercicio 30 minutos',
    icon: 'Dumbbell',
    frequency: 'weekly',
    daysPerWeek: 4,
    createdAt: subDays(new Date(), 25).toISOString(),
    completedDates: generateWeeklyCompletedDates(subDays(new Date(), 25), 3, 4), // 3 semanas, 4 días/semana
    reminderEnabled: true,
    reminderTime: '07:00',
    order: 2,
  },
  {
    id: 'reading-habit',
    name: 'Leer 10 páginas',
    icon: 'BookOpen',
    frequency: 'weekly',
    daysPerWeek: 5,
    createdAt: subDays(new Date(), 20).toISOString(),
    completedDates: generateWeeklyCompletedDates(subDays(new Date(), 20), 2, 5), // 2 semanas, 5 días/semana
    reminderEnabled: false,
    order: 3,
  },
  {
    id: 'meditation-habit',
    name: 'Meditación 10 minutos',
    icon: 'Brain',
    frequency: 'daily',
    createdAt: subDays(new Date(), 15).toISOString(),
    completedDates: generateCompletedDates(subDays(new Date(), 15), 12), // 12 de 15 días
    reminderEnabled: true,
    reminderTime: '08:00',
    order: 4,
  },
  {
    id: 'water-habit',
    name: 'Beber 8 vasos de agua',
    icon: 'Droplets',
    frequency: 'daily',
    createdAt: subDays(new Date(), 10).toISOString(),
    completedDates: generateCompletedDates(subDays(new Date(), 10), 8), // 8 de 10 días
    reminderEnabled: true,
    reminderTime: '09:00',
    order: 5,
  },
  {
    id: 'finance-habit',
    name: 'Revisión de gastos semanal',
    icon: 'PiggyBank',
    frequency: 'weekly',
    daysPerWeek: 1,
    createdAt: subDays(new Date(), 28).toISOString(),
    completedDates: generateWeeklyCompletedDates(subDays(new Date(), 28), 4, 1), // 4 semanas, 1 día/semana
    reminderEnabled: true,
    reminderTime: '19:00',
    order: 6,
  },
];

// Entradas de gratitud de ejemplo
export const SEED_GRATITUDE_ENTRIES: GratitudeEntry[] = [
  {
    id: 'gratitude-1',
    date: formatISO(subDays(new Date(), 1), { representation: 'date' }),
    content: 'Mi familia, mi salud, y tener un trabajo que me gusta',
    note: 'Fue un día muy productivo en el trabajo',
  },
  {
    id: 'gratitude-2',
    date: formatISO(subDays(new Date(), 2), { representation: 'date' }),
    content: 'El sol brillando, una buena conversación con un amigo, y la comida deliciosa',
    note: 'Me sentí muy agradecido por las pequeñas cosas',
  },
  {
    id: 'gratitude-3',
    date: formatISO(subDays(new Date(), 3), { representation: 'date' }),
    content: 'Mi mascota, la música que me inspira, y tener un hogar cómodo',
    note: 'Mi gato me hizo reír mucho hoy',
  },
  {
    id: 'gratitude-4',
    date: formatISO(subDays(new Date(), 4), { representation: 'date' }),
    content: 'La oportunidad de aprender algo nuevo, mi creatividad, y la naturaleza',
    note: 'Hice una caminata muy relajante',
  },
  {
    id: 'gratitude-5',
    date: formatISO(subDays(new Date(), 5), { representation: 'date' }),
    content: 'La tecnología que me conecta con otros, mi capacidad de adaptación, y la risa',
    note: 'Vi una película muy divertida con mi pareja',
  },
  {
    id: 'gratitude-6',
    date: formatISO(subDays(new Date(), 6), { representation: 'date' }),
    content: 'Mi libertad, las oportunidades que tengo, y la paz interior',
    note: 'Medité por 15 minutos y me sentí muy centrado',
  },
  {
    id: 'gratitude-7',
    date: formatISO(subDays(new Date(), 7), { representation: 'date' }),
    content: 'Mi capacidad de perdonar, la sabiduría que he ganado, y la esperanza',
    note: 'Tuve una conversación muy profunda con mi hermana',
  },
];

// Funciones auxiliares para generar fechas completadas
function generateCompletedDates(startDate: Date, count: number): string[] {
  const dates: string[] = [];
  const totalDays = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generar fechas aleatorias pero realistas
  for (let i = 0; i < count && i < totalDays; i++) {
    const randomDay = Math.floor(Math.random() * totalDays);
    const date = addDays(startDate, randomDay);
    const dateString = formatISO(date, { representation: 'date' });
    
    if (!dates.includes(dateString)) {
      dates.push(dateString);
    }
  }
  
  return dates.sort();
}

function generateWeeklyCompletedDates(startDate: Date, weeks: number, daysPerWeek: number): string[] {
  const dates: string[] = [];
  
  for (let week = 0; week < weeks; week++) {
    const weekStart = addDays(startDate, week * 7);
    
    // Generar días aleatorios de la semana (0-6, donde 0 es domingo)
    const weekDays = [];
    while (weekDays.length < daysPerWeek) {
      const randomDay = Math.floor(Math.random() * 7);
      if (!weekDays.includes(randomDay)) {
        weekDays.push(randomDay);
      }
    }
    
    weekDays.forEach(dayOfWeek => {
      const date = addDays(weekStart, dayOfWeek);
      if (date <= new Date()) { // Solo fechas pasadas
        dates.push(formatISO(date, { representation: 'date' }));
      }
    });
  }
  
  return dates.sort();
}

// Configuración de datos de ejemplo por usuario
export const SEED_DATA = {
  [DEV_USER.uid]: {
    habits: SEED_HABITS,
    gratitudeEntries: SEED_GRATITUDE_ENTRIES,
  },
};
