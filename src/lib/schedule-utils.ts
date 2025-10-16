import { RoutineSchedule } from './types';

export interface GroupedSchedule {
  label: string;
  time: string;
  days: string[];
  count: number;
}

/**
 * Agrupa los horarios de una rutina de manera inteligente
 * Ej: Si todos los días de semana tienen la misma hora, muestra "Días de semana a las 8:00"
 */
export function groupSchedules(schedules: RoutineSchedule[]): GroupedSchedule[] {
  try {
    if (!schedules || schedules.length === 0) {
      return [];
    }

  // Agrupar por hora
  const timeGroups = new Map<string, RoutineSchedule[]>();
  
  schedules.forEach(schedule => {
    const time = schedule.time;
    if (!timeGroups.has(time)) {
      timeGroups.set(time, []);
    }
    timeGroups.get(time)!.push(schedule);
  });

  const groupedSchedules: GroupedSchedule[] = [];

  timeGroups.forEach((schedulesForTime, time) => {
    // Ordenar los días según el orden cronológico de la semana (Lunes a Domingo)
    const dayOrder = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const days = schedulesForTime.map(s => s.day).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    
    // Verificar si es un patrón conocido
    const pattern = detectDayPattern(days);
    
    if (pattern) {
      groupedSchedules.push({
        label: `${pattern.label} a las ${formatTime(time)}`,
        time: formatTime(time),
        days: days,
        count: days.length
      });
    } else {
      // Si todos los días tienen la misma hora, mostrar como un solo grupo
      // independientemente de si son consecutivos o no
      // Ordenar los días según el orden cronológico de la semana (Lunes a Domingo)
      const dayOrder = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
      const sortedDays = [...days].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
      const dayNames = sortedDays.map(day => getDayName(day));
      let label: string;
      
      if (days.length === 1) {
        label = `${dayNames[0]} a las ${formatTime(time)}`;
      } else if (days.length === 2) {
        label = `${dayNames[0]} y ${dayNames[1]} a las ${formatTime(time)}`;
      } else {
        // Para 3 o más días, mostrar todos los días en una lista
        label = `${dayNames.slice(0, -1).join(', ')} y ${dayNames[dayNames.length - 1]} a las ${formatTime(time)}`;
      }
      
      groupedSchedules.push({
        label,
        time: formatTime(time),
        days: sortedDays, // Usar los días ordenados
        count: days.length
      });
    }
  });

    return groupedSchedules;
  } catch (error) {
    console.error('Error grouping schedules:', error);
    return [];
  }
}

/**
 * Detecta patrones conocidos de días
 */
function detectDayPattern(days: string[]): { label: string } | null {
  // Ordenar los días según el orden cronológico de la semana (Lunes a Domingo)
  const dayOrder = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const sortedDays = [...days].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  
  // Todos los días (Lunes a Domingo)
  if (sortedDays.length === 7 && 
      sortedDays.every((day, index) => day === dayOrder[index])) {
    return { label: 'Todos los días' };
  }
  
  // Días de semana (Lunes a Viernes)
  if (sortedDays.length === 5 && 
      sortedDays.every((day, index) => day === dayOrder[index])) {
    return { label: 'Días de semana' };
  }
  
  // Fin de semana (Sábado y Domingo)
  if (sortedDays.length === 2 && 
      sortedDays.includes('S') && sortedDays.includes('D')) {
    return { label: 'Fin de semana' };
  }
  
  return null;
}

/**
 * Agrupa días consecutivos de manera inteligente
 */
function groupConsecutiveDays(days: string[]): string[][] {
  const dayOrder = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const sortedDays = [...days].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  
  // Si son pocos días (3 o menos), no agrupar para evitar confusión
  if (sortedDays.length <= 3) {
    return sortedDays.map(day => [day]);
  }
  
  const groups: string[][] = [];
  let currentGroup: string[] = [sortedDays[0]];
  
  for (let i = 1; i < sortedDays.length; i++) {
    const currentDayIndex = dayOrder.indexOf(sortedDays[i]);
    const previousDayIndex = dayOrder.indexOf(sortedDays[i - 1]);
    
    // Si es el siguiente día consecutivo
    if (currentDayIndex === previousDayIndex + 1) {
      currentGroup.push(sortedDays[i]);
    } else {
      // Si no es consecutivo, cerrar el grupo actual y empezar uno nuevo
      groups.push([...currentGroup]);
      currentGroup = [sortedDays[i]];
    }
  }
  
  // Agregar el último grupo
  groups.push(currentGroup);
  
  return groups;
}

/**
 * Obtiene el nombre completo del día
 */
function getDayName(dayCode: string): string {
  const dayNames: Record<string, string> = {
    'L': 'Lunes',
    'M': 'Martes', 
    'X': 'Miércoles',
    'J': 'Jueves',
    'V': 'Viernes',
    'S': 'Sábado',
    'D': 'Domingo'
  };
  
  return dayNames[dayCode] || dayCode;
}

/**
 * Formatea la hora para mostrar
 */
function formatTime(time: string): string {
  // Convertir de formato 24h a formato 12h con AM/PM
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Genera un resumen de texto para los horarios agrupados
 */
export function generateScheduleSummary(schedules: RoutineSchedule[]): string {
  try {
    const grouped = groupSchedules(schedules);
    
    if (grouped.length === 0) {
      return 'Sin horarios programados';
    }
    
    if (grouped.length === 1) {
      return grouped[0].label; // El label ya incluye la hora
    }
    
    // Múltiples grupos de horarios - ordenar por el primer día de cada grupo
    const dayOrder = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const sortedGroups = grouped.sort((a, b) => {
      const firstDayA = a.days[0];
      const firstDayB = b.days[0];
      return dayOrder.indexOf(firstDayA) - dayOrder.indexOf(firstDayB);
    });
    
    const summaries = sortedGroups.map(group => group.label); // El label ya incluye la hora
    const lastSummary = summaries.pop();
    
    return `${summaries.join(', ')} y ${lastSummary}`;
  } catch (error) {
    console.error('Error generating schedule summary:', error);
    return 'Horarios programados';
  }
}
