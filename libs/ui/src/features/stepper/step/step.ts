import { Component, computed, inject, input, InputSignal } from '@angular/core';
import { StepperConfig } from '../stepper.config';
import { StepperService } from '../stepper.service';
import { STEPPER_CONFIG } from '../stepper.token';
import { stepperColor, stepperValue } from '../stepper.types';

@Component({
  selector: 'tls-step',
  imports: [],
  templateUrl: './step.html',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Step {
  private _config: StepperConfig = inject(STEPPER_CONFIG);
  private _stepperService: StepperService = inject(StepperService);

  // Inputs
  public readonly value: InputSignal<stepperValue> = input.required<stepperValue>();
  public readonly label: InputSignal<string | undefined> = input<string | undefined>();
  public readonly description: InputSignal<string | undefined> = input<string | undefined>();
  public readonly color: InputSignal<stepperColor> = input<stepperColor>(this._config.step.color);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  private _active = computed(() => this._stepperService.active?.() === this.value());

  protected hostClasses = computed(() => {
    const className = 'tls-step';

    const array: string[] = [className];

    if (this._active()) array.push(`${className}--active`);
    if (this.disabled()) array.push(`${className}--disabled`);

    return array;
  });
}
