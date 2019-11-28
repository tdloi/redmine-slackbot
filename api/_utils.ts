import { configs } from './_settings';
import { Dayjs } from 'dayjs';

export function getCurrentTimeZoneDate(date: Dayjs) {
  const timezone = configs.TIMEZONE;
  if (timezone > 0) {
    return date.add(timezone, 'hour');
  }

  return date.subtract(timezone, 'hour');
}
