import { InjectionToken } from '@angular/core';
import { CalendarConfig, DEFAULT_CALENDAR_CONFIG } from './calendar.config';

export const CALENDAR_CONFIG = new InjectionToken<CalendarConfig>('CALENDAR_CONFIG', {
  factory: () => DEFAULT_CALENDAR_CONFIG,
});
