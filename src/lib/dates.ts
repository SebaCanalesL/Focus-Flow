import { DateTime } from 'luxon';

// Consistent timezone across the app
export const TZ = 'America/Santiago';

/**
 * Generates a consistent, timezone-aware date key in 'yyyy-LL-dd' format.
 * @param d - A luxon DateTime object. Defaults to the current time in the app's timezone.
 * @returns A string representation of the date, e.g., "2024-07-28".
 */
export const dayKey = (d: DateTime = DateTime.now().setZone(TZ)): string => {
  return d.toFormat('yyyy-LL-dd');
};

/**
 * Converts a standard Date object or a string into a timezone-aware luxon DateTime object.
 * @param d - The date to convert.
 * @returns A luxon DateTime object set to the app's timezone.
 */
export const toZoned = (d: Date | string): DateTime => {
  if (typeof d === 'string') {
    return DateTime.fromISO(d, { zone: TZ });
  }
  return DateTime.fromJSDate(d).setZone(TZ);
};

/**
 * Formats a date to a readable string
 * @param date - The date to format
 * @param format - The format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export const format = (date: Date | string | DateTime, format: string = 'dd/MM/yyyy'): string => {
  const dt = date instanceof DateTime ? date : toZoned(date);
  return dt.toFormat(format);
};

/**
 * Checks if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export const isToday = (date: Date | string | DateTime): boolean => {
  const dt = date instanceof DateTime ? date : toZoned(date);
  const today = DateTime.now().setZone(TZ);
  return dt.hasSame(today, 'day');
};

/**
 * Parses an ISO string to a DateTime object
 * @param isoString - The ISO string to parse
 * @returns DateTime object
 */
export const parseISO = (isoString: string): DateTime => {
  return DateTime.fromISO(isoString, { zone: TZ });
};
