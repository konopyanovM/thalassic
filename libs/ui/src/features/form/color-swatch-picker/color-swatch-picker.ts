import { Listbox, Option as ListboxOption } from '@angular/aria/listbox';
import {
  Component,
  computed,
  forwardRef,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import {
  FORM_CONTROL,
  normalizeOptions,
  Option,
  optionInput,
  ValueFormControl,
} from '../../../abstract/form';
import { size } from '../../../types';
import { ColorSwatch } from '../../color-swatch';
import { canonicalHex } from '../color-picker/color.utils';
import { COLOR_SWATCH_PICKER_CONFIG } from './color-swatch-picker.token';

/**
 * Single-select list of color swatches: a WAI-ARIA listbox with roving tabindex,
 * where every offered color is a one-tap option and the selected one is ringed.
 *
 * Options follow the same contract the other selection controls use — a list of
 * plain colors, or objects read through `optionValue` / `optionLabel` /
 * `optionColor`. Splitting the stored value from the color drawn is what lets a
 * theme token be offered: a swatch can paint `var(--color-blue)` while the value
 * committed stays whatever identifies that choice to the consumer.
 *
 * A value matching no option simply leaves every swatch unselected. Values are
 * compared as they are given, except that two colors written differently
 * (`#FFF` and `#ffffff`) count as the same choice.
 */
@Component({
  selector: 'tls-color-swatch-picker',
  imports: [ColorSwatch, Listbox, ListboxOption],
  templateUrl: './color-swatch-picker.html',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ColorSwatchPicker) }],
})
export class ColorSwatchPicker<T = unknown, V = string> extends ValueFormControl<V | null> {
  // Injections
  private readonly _config = inject(COLOR_SWATCH_PICKER_CONFIG);

  protected override readonly CLASS_NAME = 'tls-color-swatch-picker';

  // Inputs
  public readonly value: ModelSignal<V | null> = model<V | null>(null);
  /** Colors offered as swatches: plain color strings, or objects the accessors below read. */
  public readonly options: InputSignal<optionInput<T>[]> = input<optionInput<T>[]>([]);
  public readonly optionLabel = input<keyof T | undefined>(undefined);
  public readonly optionValue = input<keyof T | undefined>(undefined);
  public readonly optionDisabled = input<keyof T | undefined>(undefined);
  /**
   * Property holding the color a swatch paints — any notation CSS accepts, a
   * custom property included. Defaults to the option's value, which is what a
   * list of plain colors wants.
   */
  public readonly optionColor = input<keyof T | undefined>(undefined);
  /** Size of each swatch. */
  public readonly size: InputSignal<size> = input<size>(this._config.size);

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() =>
    [this.CLASS_NAME, `${this.CLASS_NAME}--${this.size()}`].concat(this.controlClasses()),
  );

  /** Accessible name for the swatch list; `aria-labelledby` wins over it per the ARIA spec. */
  protected readonly label: Signal<string> = computed(
    () => this.ariaLabel() ?? this._config.labels.list,
  );

  protected readonly normalizedOptions: Signal<Option<V>[]> = computed(() =>
    normalizeOptions<T, V>(this.options(), {
      label: this.optionLabel(),
      value: this.optionValue(),
      disabled: this.optionDisabled(),
    }),
  );

  /**
   * The listbox's selection, as the subset of the options denoting the current
   * value — at most one, since a swatch list commits a single color.
   */
  protected readonly selectedValues: Signal<V[]> = computed(() => {
    const selected = this.normalizedOptions().find(option => this._matches(option.value));
    if (!selected) return [];

    return [selected.value];
  });

  // Protected methods
  protected onSelectionChange(values: V[]): void {
    if (this.notInteractive()) return;

    const value = values[values.length - 1];
    if (value === undefined) return;

    this.value.set(value);
    this.touched.set(true);
  }

  /** The color the option's swatch paints. */
  protected color(option: Option<V>): string {
    const key = this.optionColor();
    const source = option.source;
    if (key !== undefined && source !== null && typeof source === 'object') {
      return String((source as T)[key]);
    }

    return String(option.value);
  }

  // Private methods
  // An option is the current value when it is that value, or when both are
  // colors that only differ in notation — a picker offering `#FFF` still shows
  // the choice when the value it was handed back reads `#ffffff`. Anything the
  // color parser cannot read (a theme token, an id, an enum member) is compared
  // as given, which is the only meaningful test for it.
  private _matches(optionValue: V): boolean {
    const value = this.value();
    if (value === null) return false;
    if (optionValue === value) return true;
    if (typeof optionValue !== 'string' || typeof value !== 'string') return false;

    const option = canonicalHex(optionValue);
    if (!option) return false;

    return option === canonicalHex(value);
  }
}
