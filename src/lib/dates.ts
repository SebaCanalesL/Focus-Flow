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
