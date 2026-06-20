import { InjectionToken } from '@angular/core';
import {
  DEFAULT_FORM_CONTROL_GROUP_CONFIG,
  FormControlGroupConfig,
} from './form-control-group.config';

export const FORM_CONTROL_GROUP_CONFIG = new InjectionToken<FormControlGroupConfig>(
  'FORM_CONTROL_GROUP_CONFIG',
  {
    factory: () => DEFAULT_FORM_CONTROL_GROUP_CONFIG,
  },
);

