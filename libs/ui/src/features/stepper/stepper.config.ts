import { stepperColor, stepperOrientation } from './stepper.types';

export interface StepperConfig {
  orientation: stepperOrientation;
  linear: boolean;
  step: StepConfig;
}

export interface StepConfig {
  color: stepperColor;
}

export const DEFAULT_STEP_CONFIG: StepConfig = {
  color: 'primary',
};

export const DEFAULT_STEPPER_CONFIG: StepperConfig = {
  orientation: 'horizontal',
  linear: false,
  step: DEFAULT_STEP_CONFIG,
};
