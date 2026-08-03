import { LocaleConfig } from './locale.config';

/** Matches a quoted literal in a `date-fns` format pattern, e.g. the `'h'` in `"HH 'h' mm"`. */
const QUOTED_LITERAL = /'[^']*'/g;

/** Day-period tokens (`a`, `b`, `B`) — their presence marks a pattern as 12-hour. */
const DAY_PERIOD_TOKEN = /[abB]/;

/**
 * Whether times render on a 12-hour clock. A `'locale'` cycle probes the configured
 * `date-fns` locale's short time pattern for a day-period token; with no locale
 * configured `date-fns` formats as `en-US`, which is 12-hour.
 */
export const isHour12 = (config: LocaleConfig): boolean => {
  if (config.hourCycle !== 'locale') return config.hourCycle === 12;

  const locale = config.dateFns;
  if (!locale) return true;

  return DAY_PERIOD_TOKEN.test(
    locale.formatLong.time({ width: 'short' }).replace(QUOTED_LITERAL, ''),
  );
};
