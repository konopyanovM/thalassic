import { de, enUS } from 'date-fns/locale';
import { isHour12 } from './is-hour12';
import { DEFAULT_LOCALE_CONFIG } from './locale.config';

describe('isHour12', () => {
  it('honours an explicit 12-hour cycle regardless of locale', () => {
    expect(isHour12({ dateFns: de, hourCycle: 12 })).toBe(true);
  });

  it('honours an explicit 24-hour cycle regardless of locale', () => {
    expect(isHour12({ dateFns: enUS, hourCycle: 24 })).toBe(false);
  });

  it('defaults to 12-hour when no locale is configured', () => {
    expect(isHour12(DEFAULT_LOCALE_CONFIG)).toBe(true);
  });

  it('follows a 12-hour locale', () => {
    expect(isHour12({ dateFns: enUS, hourCycle: 'locale' })).toBe(true);
  });

  it('follows a 24-hour locale', () => {
    expect(isHour12({ dateFns: de, hourCycle: 'locale' })).toBe(false);
  });
});
