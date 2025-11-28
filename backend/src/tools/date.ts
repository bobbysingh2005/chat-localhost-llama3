import { format, addDays, nextMonday, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export interface DateParams {
  location?: string;
  timezone?: string;
  date?: string;
  weekday?: string;
  daysToAdd?: number;
}

export function getCurrentDate(params: DateParams) {
  const tz = params.timezone || 'Asia/Kolkata';
  const now = utcToZonedTime(new Date(), tz);
  return {
    date: format(now, 'yyyy-MM-dd'),
    day: format(now, 'EEEE'),
    time: format(now, 'HH:mm:ss'),
    timezone: tz,
  };
}

export function getNextWeekday(params: DateParams) {
  const tz = params.timezone || 'Asia/Kolkata';
  const baseDate = params.date ? utcToZonedTime(parseISO(params.date), tz) : utcToZonedTime(new Date(), tz);
  let nextDate;
  if (params.weekday?.toLowerCase() === 'monday') {
    nextDate = nextMonday(baseDate);
  } else {
    // Add support for other weekdays if needed
    nextDate = addDays(baseDate, params.daysToAdd || 1);
  }
  return {
    date: format(nextDate, 'yyyy-MM-dd'),
    day: format(nextDate, 'EEEE'),
    timezone: tz,
  };
}

export function addDaysToDate(params: DateParams) {
  const tz = params.timezone || 'Asia/Kolkata';
  const baseDate = params.date ? utcToZonedTime(parseISO(params.date), tz) : utcToZonedTime(new Date(), tz);
  const futureDate = addDays(baseDate, params.daysToAdd || 1);
  return {
    date: format(futureDate, 'yyyy-MM-dd'),
    day: format(futureDate, 'EEEE'),
    timezone: tz,
  };
}
