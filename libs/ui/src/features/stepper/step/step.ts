import { TabPanel } from '@angular/aria/tabs';
import {
  Component,
  computed,
  contentChild,
  inject,
  input,
  InputSignal,
  Signal,
  TemplateRef,
} from '@angular/core';
import { StepperConfig } from '../stepper.config';
import { STEPPER_CONFIG } from '../stepper.token';
import { stepperColor, stepperValue } from '../stepper.types';

@Component({
  selector: 'tls-step',
  imports: [],
  templateUrl: './step.html',
  // Content is projected eagerly (no `ngTabContent`) to keep `<tls-step>content</tls-step>`
  // as a plain content-projecting API. This makes TabPanel log a dev-mode-only
  // "must have an ngTabContent" diagnostic, which is expected and harmless here.
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Step {
  private _config: StepperConfig = inject(STEPPER_CONFIG);
  private readonly _tabPanel = inject(TabPanel);

  public readonly iconTemplateRef = contentChild<TemplateRef<unknown>>('stepIcon');
  public readonly completedIconTemplateRef = contentChild<TemplateRef<unknown>>('stepCompletedIcon');

  // Inputs
  public readonly value: Signal<stepperValue> = this._tabPanel.value;
  public readonly label: InputSignal<string | undefined> = input<string | undefined>();
  public readonly description: InputSignal<string | undefined> = input<string | undefined>();
  public readonly color: InputSignal<stepperColor> = input<stepperColor>(this._config.step.color);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  protected hostClasses = computed(() => {
    const className = 'tls-step';

    const array: string[] = [className];

    if (this._tabPanel.visible()) array.push(`${className}--active`);
    if (this.disabled()) array.push(`${className}--disabled`);

    return array;
  });
}
