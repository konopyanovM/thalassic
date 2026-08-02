import { Locale } from 'date-fns';
import { LocaleConfig } from './locale.config';

/**
 * `date-fns` format options carrying the configured locale, or `undefined` when none is set
 * (so `date-fns` falls back to its built-in `en-US`). Returning `undefined` rather than
 * `{ locale: undefined }` satisfies `exactOptionalPropertyTypes`.
 */
export const localeFormatOptions = (config: LocaleConfig): { locale: Locale } | undefined =>
  config.dateFns ? { locale: config.dateFns } : undefined;
