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
import { StepperConfig } from './stepper.config';
import { StepperService } from './stepper.service';
import { STEPPER_CONFIG } from './stepper.token';
import { stepperOrientation, StepperSelectEvent, stepperValue } from './stepper.types';

@Component({
  selector: 'tls-stepper',
  imports: [NgTemplateOutlet],
  templateUrl: './stepper.html',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [StepperService],
})
export class Stepper {
  private static _counter = 0;
  protected readonly panelId = `tls-stepper-panel-${++Stepper._counter}`;

  private _config: StepperConfig = inject(STEPPER_CONFIG);
  private _stepperService: StepperService = inject(StepperService);

  protected steps: Signal<readonly Step[]> = contentChildren(Step);
  protected completedTemplateRef: Signal<TemplateRef<unknown> | undefined> =
    contentChild<TemplateRef<unknown>>('completedTemplate');

  public readonly active: ModelSignal<stepperValue> = model.required<stepperValue>();
  public readonly orientation: InputSignal<stepperOrientation> = input<stepperOrientation>(
    this._config.orientation,
  );
  public readonly completed: InputSignal<boolean> = input<boolean>(false);
  public readonly linear: InputSignal<boolean> = input<boolean>(this._config.linear);

  public readonly stepSelect: OutputEmitterRef<StepperSelectEvent> = output<StepperSelectEvent>();

  protected hostClasses = computed(() => {
    const className = 'tls-stepper';

    const array: string[] = [className];

    array.push(`${className}--${this.orientation()}`);
    if (this.completed()) array.push(`${className}--completed`);

    return array;
  });

  protected activeIndex = computed(() =>
    this.steps().findIndex(step => step.value() === this.active()),
  );

  constructor() {
    this._stepperService.active = this.active.asReadonly();
  }

  protected onSelect(step: Step, index: number): void {
    if (step.disabled()) return;
    if (this.linear() && index > this.activeIndex() + 1) return;

    this.active.set(step.value());

    const eventData: StepperSelectEvent = {
      index: index,
      value: step.value(),
    };
    this.stepSelect.emit(eventData);
  }
}
