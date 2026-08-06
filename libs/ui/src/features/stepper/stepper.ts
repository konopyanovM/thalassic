import { Tab as AriaTab, TabList, Tabs as AriaTabs } from '@angular/aria/tabs';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
} from '@angular/core';
import { Step } from './step';
import { StepperConfig, StepperLabels } from './stepper.config';
import { STEPPER_CONFIG } from './stepper.token';
import {
  stepperLabelPosition,
  stepperOrientation,
  StepperSelectEvent,
  stepperValue,
} from './stepper.types';

@Component({
  selector: 'tls-stepper',
  imports: [NgTemplateOutlet, TabList, AriaTab],
  templateUrl: './stepper.html',
  hostDirectives: [AriaTabs],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Stepper {
  private readonly _config: StepperConfig = inject(STEPPER_CONFIG);

  /** Visually hidden state texts appended to a step's accessible name. */
  protected readonly labels: StepperLabels = this._config.labels;

  protected steps: Signal<readonly Step[]> = contentChildren(Step);
  protected completedTemplateRef = contentChild<TemplateRef<unknown>>('completedTemplate');
  protected completedIconTemplateRef = contentChild<TemplateRef<unknown>>('stepCompletedIcon');

  public readonly active: ModelSignal<stepperValue> = model.required<stepperValue>();
  public readonly orientation: InputSignal<stepperOrientation> = input<stepperOrientation>(
    this._config.orientation,
  );
  public readonly labelPosition: InputSignal<stepperLabelPosition> = input<stepperLabelPosition>(
    this._config.labelPosition,
  );
  public readonly completed: InputSignal<boolean> = input<boolean>(false);
  public readonly linear: InputSignal<boolean> = input<boolean>(this._config.linear);

  /** Accessible name for the stepper tablist. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  public readonly stepSelect: OutputEmitterRef<StepperSelectEvent> = output<StepperSelectEvent>();

  protected hostClasses = computed(() => {
    const className = 'tls-stepper';

    const array: string[] = [className];

    array.push(`${className}--${this.orientation()}`);
    array.push(`${className}--label-${this.labelPosition()}`);
    if (this.completed()) array.push(`${className}--completed`);

    return array;
  });

  protected activeIndex = computed(() =>
    this.steps().findIndex(step => step.value() === this.active()),
  );

  // Protected methods
  protected onSelectedTabChange(value: stepperValue | undefined): void {
    if (value === undefined) return;

    const index = this.steps().findIndex(step => step.value() === value);

    this.active.set(value);
    this.stepSelect.emit({ index, value });
  }
}
