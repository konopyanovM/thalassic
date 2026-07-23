import { color, orientation } from '../../types';

export type stepperValue = string;

export type stepperColor = color;

export type stepperOrientation = orientation;

export interface StepperSelectEvent {
  index: number;
  value: stepperValue;
}
