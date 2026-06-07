import { InjectionToken } from '@angular/core';
import { DateTimePickerConfig, DEFAULT_DATE_TIME_PICKER_CONFIG } from './date-time-picker.config';

export const DATE_TIME_PICKER_CONFIG = new InjectionToken<DateTimePickerConfig>(
  'DATE_TIME_PICKER_CONFIG',
  { factory: () => DEFAULT_DATE_TIME_PICKER_CONFIG },
);