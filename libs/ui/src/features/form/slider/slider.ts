import {
  booleanAttribute,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  numberAttribute,
  Signal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { SLIDER_CONFIG } from './slider.token';
import { sliderColor } from './slider.types';

@Component({
  selector: 'tls-slider',
  templateUrl: './slider.html',
  styleUrl: './slider.scss',
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Slider) }],
})
export class Slider extends ValueFormControl<number> {
  // Injections
  private readonly _config = inject(SLIDER_CONFIG);

  protected override CLASS_NAME = 'tls-slider';

  override readonly supportsLabelFor = true;

  // Inputs
  public readonly value: ModelSignal<number> = model<number>(this._config.min);
  public readonly min: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.min,
    { transform: numberAttribute },
  );
  public readonly max: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.max,
    { transform: numberAttribute },
  );
  public readonly step: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.step,
    { transform: numberAttribute },
  );
  public readonly color: InputSignal<sliderColor> = input<sliderColor>(this._config.color);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly tabindex: InputSignal<string | number> = input<string | number>(0);

  /**
   * Human-readable value announced instead of the raw number, for a scale whose
   * bare number means nothing on its own ("2.5×", "Medium").
   */
  public readonly valueText = input<string | undefined>(undefined);

  // Computed
  protected readonly classes: Signal<string[]> = computed<string[]>(() => {
    const className = this.CLASS_NAME;

    const array: string[] = [`${className}--${this.size()}`, `${className}--${this.color()}`];

    if (this.fluid()) array.push(`${className}--fluid`);

    return array.concat(this.controlClasses());
  });

  /**
   * Filled share of the track as a unitless 0–1 ratio. Unitless so the theme can
   * multiply it by the thumb's travel distance in `calc()`, which a percentage
   * cannot be divided out of.
   */
  protected readonly fillRatio: Signal<number> = computed<number>(() => {
    const min = this.min();
    const range = this.max() - min;

    // An empty or inverted range has no meaningful fill, and dividing by it
    // would yield Infinity/NaN.
    if (range <= 0) return 0;

    const clamped = Math.min(Math.max(this.value(), min), this.max());

    return (clamped - min) / range;
  });

  // Protected methods
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    // A range input has no native `readonly`, so a readonly (or disabled-but-
    // still-reachable) slider reverts the drag instead of committing it.
    if (this.notInteractive()) {
      target.value = String(this.value());
      return;
    }

    this.value.set(target.valueAsNumber);
  }
}
