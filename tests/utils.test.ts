import { encode, decode, getDate } from '../api/_utils';
import { configs } from '../api/_settings';

test('encode base64', () => {
  expect(encode('abc')).toBe('YWJj');
});

test('decode base64', () => {
  expect(decode('YWJj')).toBe('abc');
});

describe('test get time', () => {
  test('with input string', () => {
    configs.TIMEZONE = 7;
    const date = getDate('2019-11-30T23:00:00.000Z');
    expect(date.format('YYYY-MM-DD')).toBe('2019-12-01');
    expect(date.hour()).toBe(6);
  });

  test('with input epoch', () => {
    configs.TIMEZONE = 7;
    const date = getDate(1575154800 * 1000);
    expect(date.format('YYYY-MM-DD')).toBe('2019-12-01');
    expect(date.hour()).toBe(6);
  });

  test('with input epoch minus timezone', () => {
    configs.TIMEZONE = -7;
    const date = getDate(1575154800 * 1000);
    console.log(date);
    expect(date.format('YYYY-MM-DD')).toBe('2019-11-30');
    expect(date.hour()).toBe(16);
  });
});
