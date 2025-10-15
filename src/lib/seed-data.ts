import type { Habit, GratitudeEntry, Routine } from './types';
import { subDays, formatISO, addDays, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

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
  
  // ===== HÁBITOS PARA PROBAR RACHAS =====
  
  // Hábito diario con racha perfecta (todos los días completados)
  {
    id: 'perfect-daily-streak',
    name: 'Cepillarse los dientes 2 veces',
    icon: 'Sparkles',
    frequency: 'daily',
    createdAt: subDays(new Date(), 10).toISOString(),
    completedDates: generatePerfectDailyStreak(subDays(new Date(), 10), 10), // 10 días perfectos
    reminderEnabled: true,
    reminderTime: '08:00',
    order: 7,
  },
  
  // Hábito diario con racha rota (se saltó un día en el medio)
  {
    id: 'broken-daily-streak',
    name: 'Hacer la cama',
    icon: 'Home',
    frequency: 'daily',
    createdAt: subDays(new Date(), 8).toISOString(),
    completedDates: generateBrokenDailyStreak(subDays(new Date(), 8), 8), // 8 días con racha rota
    reminderEnabled: true,
    reminderTime: '07:30',
    order: 8,
  },
  
  // Hábito semanal 1 día - racha perfecta
  {
    id: 'perfect-weekly-1day',
    name: 'Limpieza profunda del hogar',
    icon: 'Sparkles',
    frequency: 'weekly',
    daysPerWeek: 1,
    createdAt: subDays(new Date(), 21).toISOString(),
    completedDates: generatePerfectWeeklyStreak(subDays(new Date(), 21), 3, 1), // 3 semanas perfectas
    reminderEnabled: true,
    reminderTime: '10:00',
    order: 9,
  },
  
  // Hábito semanal 3 días - racha perfecta
  {
    id: 'perfect-weekly-3days',
    name: 'Entrenamiento de fuerza',
    icon: 'Dumbbell',
    frequency: 'weekly',
    daysPerWeek: 3,
    createdAt: subDays(new Date(), 14).toISOString(),
    completedDates: generatePerfectWeeklyStreak(subDays(new Date(), 14), 2, 3), // 2 semanas perfectas
    reminderEnabled: true,
    reminderTime: '18:00',
    order: 10,
  },
  
  // Hábito semanal 5 días - racha rota (no cumplió la meta)
  {
    id: 'broken-weekly-5days',
    name: 'Estudiar programación',
    icon: 'Code',
    frequency: 'weekly',
    daysPerWeek: 5,
    createdAt: subDays(new Date(), 14).toISOString(),
    completedDates: generateBrokenWeeklyStreak(subDays(new Date(), 14), 2, 5), // 2 semanas con racha rota
    reminderEnabled: true,
    reminderTime: '19:00',
    order: 11,
  },
  
  // Hábito semanal 2 días - racha rota (no cumplió la meta)
  {
    id: 'broken-weekly-2days',
    name: 'Cocinar comida saludable',
    icon: 'ChefHat',
    frequency: 'weekly',
    daysPerWeek: 2,
    createdAt: subDays(new Date(), 7).toISOString(),
    completedDates: generateBrokenWeeklyStreak(subDays(new Date(), 7), 1, 2), // 1 semana con racha rota
    reminderEnabled: true,
    reminderTime: '17:00',
    order: 12,
  },
];

// Rutinas de ejemplo
export const SEED_ROUTINES: Routine[] = [
  {
    id: 'morning-routine',
    title: 'Rutina Matutina Energética',
    description: 'Una rutina completa para empezar el día con energía y propósito',
    imageUrl: '/routines/routine-morning-energized.png',
    stepIds: ['hydration', 'movement', 'mindfulness', 'planning'],
    customSteps: [
      {
        id: 'custom-1',
        title: 'Abrir las cortinas y respirar aire fresco',
        description: 'Permite que la luz natural entre y oxigena tu espacio'
      }
    ],
    reminders: [
      {
        id: 'reminder-1',
        day: 'L',
        time: '07:00',
        enabled: true
      },
      {
        id: 'reminder-2',
        day: 'M',
        time: '07:00',
        enabled: true
      },
      {
        id: 'reminder-3',
        day: 'X',
        time: '07:00',
        enabled: true
      },
      {
        id: 'reminder-4',
        day: 'J',
        time: '07:00',
        enabled: true
      },
      {
        id: 'reminder-5',
        day: 'V',
        time: '07:00',
        enabled: true
      }
    ],
    createdAt: subDays(new Date(), 10).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'evening-routine',
    title: 'Rutina Nocturna Relajante',
    description: 'Una rutina para cerrar el día de manera tranquila y preparar el descanso',
    imageUrl: '/routines/routine-morning-energized.png',
    stepIds: ['gratitude', 'journaling', 'breathing'],
    customSteps: [
      {
        id: 'custom-2',
        title: 'Preparar la ropa del día siguiente',
        description: 'Organiza todo lo que necesites para el próximo día'
      },
      {
        id: 'custom-3',
        title: 'Aplicar crema hidratante',
        description: 'Cuida tu piel antes de dormir'
      }
    ],
    reminders: [
      {
        id: 'reminder-6',
        day: 'L',
        time: '21:30',
        enabled: true
      },
      {
        id: 'reminder-7',
        day: 'M',
        time: '21:30',
        enabled: true
      },
      {
        id: 'reminder-8',
        day: 'X',
        time: '21:30',
        enabled: true
      },
      {
        id: 'reminder-9',
        day: 'J',
        time: '21:30',
        enabled: true
      },
      {
        id: 'reminder-10',
        day: 'V',
        time: '21:30',
        enabled: true
      },
      {
        id: 'reminder-11',
        day: 'S',
        time: '22:00',
        enabled: true
      },
      {
        id: 'reminder-12',
        day: 'D',
        time: '22:00',
        enabled: true
      }
    ],
    createdAt: subDays(new Date(), 8).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'workout-routine',
    title: 'Rutina de Ejercicio',
    description: 'Una rutina completa de ejercicio para mantenerte en forma',
    imageUrl: '/routines/routine-morning-energized.png',
    stepIds: ['hydration', 'movement'],
    customSteps: [
      {
        id: 'custom-4',
        title: 'Calentamiento de 5 minutos',
        description: 'Prepara tu cuerpo con estiramientos suaves'
      },
      {
        id: 'custom-5',
        title: 'Ejercicio principal (30 minutos)',
        description: 'Realiza tu rutina de ejercicio preferida'
      },
      {
        id: 'custom-6',
        title: 'Enfriamiento y estiramientos',
        description: 'Relaja los músculos y previene lesiones'
      }
    ],
    reminders: [
      {
        id: 'reminder-13',
        day: 'M',
        time: '18:00',
        enabled: true
      },
      {
        id: 'reminder-14',
        day: 'J',
        time: '18:00',
        enabled: true
      },
      {
        id: 'reminder-15',
        day: 'S',
        time: '10:00',
        enabled: true
      }
    ],
    createdAt: subDays(new Date(), 5).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  }
];

// Entradas de gratitud de ejemplo
export const SEED_GRATITUDE_ENTRIES: GratitudeEntry[] = [
  {
    id: 'gratitude-1',
    dateKey: formatISO(subDays(new Date(), 1), { representation: 'date' }),
    date: formatISO(subDays(new Date(), 1), { representation: 'date' }),
    content: 'Mi familia, mi salud, y tener un trabajo que me gusta',
    note: 'Fue un día muy productivo en el trabajo',
  },
  {
    id: 'gratitude-2',
    dateKey: formatISO(subDays(new Date(), 2), { representation: 'date' }),
    date: formatISO(subDays(new Date(), 2), { representation: 'date' }),
    content: 'El sol brillando, una buena conversación con un amigo, y la comida deliciosa',
    note: 'Me sentí muy agradecido por las pequeñas cosas',
  },
  {
    id: 'gratitude-3',
    dateKey: formatISO(subDays(new Date(), 3), { representation: 'date' }),
    date: formatISO(subDays(new Date(), 3), { representation: 'date' }),
    content: 'Mi mascota, la música que me inspira, y tener un hogar cómodo',
    note: 'Mi gato me hizo reír mucho hoy',
  },
  {
    id: 'gratitude-4',
    dateKey: formatISO(subDays(new Date(), 4), { representation: 'date' }),
    date: formatISO(subDays(new Date(), 4), { representation: 'date' }),
    content: 'La oportunidad de aprender algo nuevo, mi creatividad, y la naturaleza',
    note: 'Hice una caminata muy relajante',
  },
  {
    id: 'gratitude-5',
    dateKey: formatISO(subDays(new Date(), 5), { representation: 'date' }),
    date: formatISO(subDays(new Date(), 5), { representation: 'date' }),
    content: 'La tecnología que me conecta con otros, mi capacidad de adaptación, y la risa',
    note: 'Vi una película muy divertida con mi pareja',
  },
  {
    id: 'gratitude-6',
    dateKey: formatISO(subDays(new Date(), 6), { representation: 'date' }),
    date: formatISO(subDays(new Date(), 6), { representation: 'date' }),
    content: 'Mi libertad, las oportunidades que tengo, y la paz interior',
    note: 'Medité por 15 minutos y me sentí muy centrado',
  },
  {
    id: 'gratitude-7',
    dateKey: formatISO(subDays(new Date(), 7), { representation: 'date' }),
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
    const weekDays: number[] = [];
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

// Función para generar racha diaria perfecta (todos los días)
function generatePerfectDailyStreak(startDate: Date, days: number): string[] {
  const dates: string[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    if (date <= new Date()) { // Solo fechas pasadas
      dates.push(formatISO(date, { representation: 'date' }));
    }
  }
  
  return dates.sort();
}

// Función para generar racha diaria rota (se salta un día en el medio)
function generateBrokenDailyStreak(startDate: Date, days: number): string[] {
  const dates: string[] = [];
  const skipDay = Math.floor(days / 2); // Saltar el día del medio
  
  for (let i = 0; i < days; i++) {
    if (i === skipDay) continue; // Saltar este día
    
    const date = addDays(startDate, i);
    if (date <= new Date()) { // Solo fechas pasadas
      dates.push(formatISO(date, { representation: 'date' }));
    }
  }
  
  return dates.sort();
}

// Función para generar racha semanal perfecta
function generatePerfectWeeklyStreak(startDate: Date, weeks: number, daysPerWeek: number): string[] {
  const dates: string[] = [];
  
  for (let week = 0; week < weeks; week++) {
    const weekStart = addDays(startDate, week * 7);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Tomar los primeros díasPerWeek días de la semana
    for (let i = 0; i < Math.min(daysPerWeek, daysInWeek.length); i++) {
      const date = daysInWeek[i];
      if (date <= new Date()) { // Solo fechas pasadas
        dates.push(formatISO(date, { representation: 'date' }));
      }
    }
  }
  
  return dates.sort();
}

// Función para generar racha semanal rota (no cumple la meta)
function generateBrokenWeeklyStreak(startDate: Date, weeks: number, daysPerWeek: number): string[] {
  const dates: string[] = [];
  
  for (let week = 0; week < weeks; week++) {
    const weekStart = addDays(startDate, week * 7);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Tomar menos días de los requeridos (generar racha rota)
    const actualDays = Math.max(1, daysPerWeek - 1); // Siempre al menos 1 día menos
    
    for (let i = 0; i < Math.min(actualDays, daysInWeek.length); i++) {
      const date = daysInWeek[i];
      if (date <= new Date()) { // Solo fechas pasadas
        dates.push(formatISO(date, { representation: 'date' }));
      }
    }
  }
  
  return dates.sort();
}

// Configuración de datos de ejemplo por usuario
export const SEED_DATA = {
  [DEV_USER.uid]: {
    habits: SEED_HABITS,
    gratitudeEntries: SEED_GRATITUDE_ENTRIES,
    routines: SEED_ROUTINES,
  },
};
