import { color, orientation } from '../../types';

export type stepperValue = string;

export type stepperColor = color;

export type stepperOrientation = orientation;

/**
 * Placement of a step's text relative to its index in a horizontal stepper:
 * `end` puts the text after the index with the last step sized to its
 * content, `bottom` centers every step in an equal column with the text under
 * the index, so the connector rail spans the full width symmetrically.
 * Vertical steppers always use `end`.
 */
export type stepperLabelPosition = 'end' | 'bottom';

export interface StepperSelectEvent {
  index: number;
  value: stepperValue;
}
