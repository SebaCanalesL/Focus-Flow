import { Routine, Reminder, RoutineSchedule } from './types';

/**
 * Migrates routines from the old reminder structure to the new schedule structure
 * This function converts reminders to schedules while preserving all data
 */
export function migrateRemindersToSchedules(routines: Routine[]): Routine[] {
  return routines.map(routine => {
    if (routine.reminders && routine.reminders.length > 0) {
      // Convert reminders to schedules
      const schedules: RoutineSchedule[] = routine.reminders.map(reminder => ({
        id: reminder.id,
        day: reminder.day,
        time: reminder.time,
        notificationEnabled: reminder.enabled, // Map the old 'enabled' to notification
        executionEnabled: true // By default, all migrated schedules are enabled for execution
      }));

      // Return the routine with schedules and keep reminders for backward compatibility
      return {
        ...routine,
        schedules,
        // Keep reminders for now to ensure backward compatibility
        reminders: routine.reminders
      };
    }
    
    // If no reminders, return routine as is
    return routine;
  });
}

/**
 * Converts a single reminder to a schedule
 */
export function reminderToSchedule(reminder: Reminder): RoutineSchedule {
  return {
    id: reminder.id,
    day: reminder.day,
    time: reminder.time,
    notificationEnabled: reminder.enabled,
    executionEnabled: true
  };
}

/**
 * Converts a schedule back to a reminder (for backward compatibility)
 */
export function scheduleToReminder(schedule: RoutineSchedule): Reminder {
  return {
    id: schedule.id,
    day: schedule.day,
    time: schedule.time,
    enabled: schedule.notificationEnabled
  };
}

/**
 * Checks if a routine needs migration (has reminders but no schedules)
 */
export function routineNeedsMigration(routine: Routine): boolean {
  return !!(routine.reminders && routine.reminders.length > 0 && (!routine.schedules || routine.schedules.length === 0));
}

/**
 * Gets all routines that need migration
 */
export function getRoutinesNeedingMigration(routines: Routine[]): Routine[] {
  return routines.filter(routineNeedsMigration);
}
