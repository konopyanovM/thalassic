import { InjectionToken } from '@angular/core';
import { DEFAULT_STEPPER_CONFIG, StepperConfig } from './stepper.config';

export const STEPPER_CONFIG = new InjectionToken<StepperConfig>('STEPPER_CONFIG', {
  factory: () => DEFAULT_STEPPER_CONFIG,
});