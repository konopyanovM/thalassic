import { Locale } from 'date-fns';

export interface LocaleConfig {
  /**
   * `date-fns` locale used by every component that formats dates (calendar month
   * names, weekday and time-grid headings, agenda labels). When omitted, `date-fns`
   * formats in its built-in `en-US` locale. Import the desired locale from
   * `date-fns/locale` (e.g. `import { fr } from 'date-fns/locale'`) and pass it here.
   */
  dateFns?: Locale;
}

export const DEFAULT_LOCALE_CONFIG: LocaleConfig = {};
