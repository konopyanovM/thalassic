import { Locale } from 'date-fns';
import { hourCycle } from './hour-cycle';

export interface LocaleConfig {
  /**
   * `date-fns` locale used by every component that formats dates (calendar month
   * names, weekday and time-grid headings, agenda labels). When omitted, `date-fns`
   * formats in its built-in `en-US` locale. Import the desired locale from
   * `date-fns/locale` (e.g. `import { fr } from 'date-fns/locale'`) and pass it here.
   */
  dateFns?: Locale;
  /**
   * Clock convention for every component that renders a time (calendar time-grid gutter
   * and event chips, date-time picker trigger and time picker). `'locale'` follows the
   * `dateFns` locale — with no locale set that is `en-US`, hence 12-hour.
   */
  hourCycle: hourCycle;
}

export const DEFAULT_LOCALE_CONFIG: LocaleConfig = { hourCycle: 'locale' };
