import { InjectionToken } from '@angular/core';
import { AccordionConfig, DEFAULT_ACCORDION_CONFIG } from './accordion.config';

export const ACCORDION_CONFIG = new InjectionToken<AccordionConfig>('ACCORDION_CONFIG', {
  factory: () => DEFAULT_ACCORDION_CONFIG,
});
