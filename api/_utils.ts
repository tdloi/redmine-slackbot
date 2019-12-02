import { configs } from './_settings';
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

export function getDate(date: string | number = null) {
  dayjs.extend(utc);
  const currentDate = date ? dayjs.utc(date) : dayjs.utc();

  const timezone = configs.TIMEZONE;
  if (timezone > 0) {
    return currentDate.add(timezone, 'hour');
  }

  return currentDate.subtract(timezone * -1, 'hour');
}

export function encode(text: string) {
  return Buffer.from(text).toString('base64');
}

export function decode(text: string) {
  return Buffer.from(text, 'base64').toString('ascii');
}
