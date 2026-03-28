import { InjectionToken } from '@angular/core';
import { DEFAULT_FORM_ITEM_CONFIG, FormItemConfig } from './form-item.config';

export const FORM_ITEM_CONFIG = new InjectionToken<FormItemConfig>('FORM_ITEM_CONFIG', {
  factory: () => DEFAULT_FORM_ITEM_CONFIG,
});
