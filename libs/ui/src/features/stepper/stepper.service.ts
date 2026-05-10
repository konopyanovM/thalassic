import { Injectable, Signal } from '@angular/core';
import { stepperValue } from './stepper.types';

@Injectable()
export class StepperService {
  public active: Signal<stepperValue> | null = null;
}
