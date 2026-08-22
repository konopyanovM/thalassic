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
  Signal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { ALPHA_MAX, HUE_MAX } from './color-range.constants';
import { COLOR_RANGE_CONFIG } from './color-range.token';
import { colorRangeChannel, colorRangeSize } from './color-range.types';

/**
 * Single-channel color slider: a native range input over a gradient track.
 * The `hue` channel spans 0–360 degrees; the `alpha` channel spans 0–100
 * percent and fades from transparent to the reference `color` over a
 * transparency checkerboard.
 */
@Component({
  selector: 'tls-color-range',
  templateUrl: './color-range.html',
  styleUrl: './color-range.scss',
  host: {
    '[class]': 'hostClasses()',
    '[style.--tls-color-range-color]': 'color()',
    '[style.--tls-color-range-thumb-color]': 'thumbColor()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ColorRange) }],
})
export class ColorRange extends ValueFormControl<number> {
  // Injections
  private readonly _config = inject(COLOR_RANGE_CONFIG);

  protected override readonly CLASS_NAME = 'tls-color-range';

  override readonly supportsLabelFor = true;

  // Inputs
  public readonly value: ModelSignal<number> = model<number>(0);
  public readonly channel: InputSignal<colorRangeChannel> = input<colorRangeChannel>('hue');
  /** Reference color the alpha track fades up to; ignored by the hue channel. */
  public readonly color: InputSignal<string> = input<string>('#000000');
  public readonly size: InputSignal<colorRangeSize> = input<colorRangeSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const array: string[] = [
      this.CLASS_NAME,
      `${this.CLASS_NAME}--${this.channel()}`,
      `${this.CLASS_NAME}--${this.size()}`,
    ];

    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    return array.concat(this.controlClasses());
  });

  protected readonly max: Signal<number> = computed(() =>
    this.channel() === 'hue' ? HUE_MAX : ALPHA_MAX,
  );

  /**
   * The thumb previews what it points at: the pure hue at the thumb's position,
   * or — on the alpha channel — the reference color.
   */
  protected readonly thumbColor: Signal<string> = computed(() => {
    if (this.channel() === 'alpha') return this.color();
    return `hsl(${this.value()}, 100%, 50%)`;
  });

  protected readonly label: Signal<string> = computed(() => {
    const explicit = this.ariaLabel();
    if (explicit) return explicit;
    return this.channel() === 'hue' ? this._config.labels.hue : this._config.labels.alpha;
  });

  // Protected methods
  protected onInput(event: Event): void {
    const range = event.target as HTMLInputElement;

    if (this.notInteractive()) {
      range.value = `${this.value()}`;
      return;
    }

    this.value.set(Number(range.value));
  }
}
