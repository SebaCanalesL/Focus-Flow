import type { Habit } from './types';
import {
  isSameDay,
  isSameWeek,
  subDays,
  startOfDay,
  startOfWeek,
  differenceInCalendarDays,
} from 'date-fns';

/**
 * Calculates the current streak for a given habit.
 * @param habit The habit object.
 * @returns The current streak count.
 */
export function calculateStreak(habit: Habit): number {
  if (!habit.completedDates || habit.completedDates.length === 0) {
    return 0;
  }

  // Sort dates descending to start from the most recent
  const sortedDates = [...habit.completedDates].map(date => new Date(date)).sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = startOfDay(new Date());
  
  // Find the most recent completion
  const mostRecentCompletion = sortedDates.find(date => startOfDay(date) <= today);

  if (!mostRecentCompletion) {
      return 0;
  }

  // Check if the habit was completed today or yesterday to be considered an active streak
  const daysSinceLastCompletion = differenceInCalendarDays(today, startOfDay(mostRecentCompletion));
  
  if (daysSinceLastCompletion > 1) {
    return 0;
  }

  streak = 1;
  let lastDate = startOfDay(mostRecentCompletion);

  // Iterate backwards from the second-to-last completion
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = startOfDay(sortedDates[i]);
    const expectedDate = subDays(lastDate, 1);
    
    // If there's a gap, stop
    if (!isSameDay(currentDate, expectedDate)) {
      break;
    }
    
    streak++;
    lastDate = currentDate;
  }

  return streak;
}


/**
 * Calculates weekly completion stats for a habit.
 * @param habit The habit object.
 * @returns An object with completed count and total target for the current week.
 */
export function calculateWeekCompletion(habit: Habit): { completed: number; total: number } {
  const total = habit.daysPerWeek || 0;
  if (habit.frequency !== 'weekly' || total === 0) {
    return { completed: 0, total: 0 };
  }

  const today = new Date();
  const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Assuming week starts on Monday

  const completedThisWeek = habit.completedDates.filter(date => 
    isSameWeek(new Date(date), startOfThisWeek, { weekStartsOn: 1 })
  ).length;

  return { completed: completedThisWeek, total };
}
