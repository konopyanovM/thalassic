import { stepperColor, stepperLabelPosition, stepperOrientation } from './stepper.types';

export interface StepperConfig {
  orientation: stepperOrientation;
  labelPosition: stepperLabelPosition;
  linear: boolean;
  labels: StepperLabels;
  step: StepConfig;
}

/** Visually hidden state texts announced by assistive technology for a step. */
export interface StepperLabels {
  completed: string;
  invalid: string;
}

export interface StepConfig {
  color: stepperColor;
}

export const DEFAULT_STEP_CONFIG: StepConfig = {
  color: 'primary',
};

export const DEFAULT_STEPPER_LABELS: StepperLabels = {
  completed: 'Completed',
  invalid: 'Invalid',
};

export const DEFAULT_STEPPER_CONFIG: StepperConfig = {
  orientation: 'horizontal',
  labelPosition: 'end',
  linear: false,
  labels: DEFAULT_STEPPER_LABELS,
  step: DEFAULT_STEP_CONFIG,
};
