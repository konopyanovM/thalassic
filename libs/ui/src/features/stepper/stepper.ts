import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChild,
  contentChildren,
  ElementRef,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
  viewChildren,
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
  protected completedTemplateRef = contentChild<TemplateRef<unknown>>('completedTemplate');
  protected completedIconTemplateRef = contentChild<TemplateRef<unknown>>('stepCompletedIcon');

  private _stepButtons = viewChildren<ElementRef<HTMLButtonElement>>('stepButton');

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

  // Protected methods
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

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const orientation = this.orientation();
    const keyNext = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const keyPrev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

    let target: number | null = null;

    switch (event.key) {
      case keyNext:
        target = this._nextFocusable(index, 1);
        break;
      case keyPrev:
        target = this._nextFocusable(index, -1);
        break;
      case 'Home':
        target = this._nextFocusable(-1, 1);
        break;
      case 'End':
        target = this._nextFocusable(this.steps().length, -1);
        break;
      default:
        return;
    }

    event.preventDefault();
    if (target === null) return;

    this._stepButtons()[target]?.nativeElement.focus();
    this.onSelect(this.steps()[target], target);
  }

  // Private methods
  private _nextFocusable(from: number, direction: 1 | -1): number | null {
    const steps = this.steps();
    for (let i = from + direction; i >= 0 && i < steps.length; i += direction) {
      if (!steps[i].disabled() && !(this.linear() && i > this.activeIndex() + 1)) return i;
    }
    return null;
  }
}
