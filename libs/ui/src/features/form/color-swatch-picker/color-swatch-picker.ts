import { Listbox, Option } from '@angular/aria/listbox';
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
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { size } from '../../../types';
import { ColorSwatch } from '../../color-swatch';
import { Icon } from '../../icon';
import { contrastForeground, parseColor, rgbaToHex } from '../color-picker/color.utils';
import { COLOR_SWATCH_PICKER_CONFIG } from './color-swatch-picker.token';

/**
 * Single-select list of color swatches: a WAI-ARIA listbox with roving
 * tabindex, where every offered color is a one-tap option and the selected one
 * carries a contrast-aware check mark. Accepts any hex/rgb()/hsl() notation in
 * `colors` and `value`, and always emits a lowercase hex string (`#rrggbb`, or
 * `#rrggbbaa` when the chosen color is translucent). A value matching none of
 * the colors simply leaves every swatch unselected.
 */
@Component({
  selector: 'tls-color-swatch-picker',
  imports: [ColorSwatch, Icon, Listbox, Option],
  templateUrl: './color-swatch-picker.html',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ColorSwatchPicker) }],
})
export class ColorSwatchPicker extends ValueFormControl<string> {
  // Injections
  private readonly _config = inject(COLOR_SWATCH_PICKER_CONFIG);

  protected override readonly CLASS_NAME = 'tls-color-swatch-picker';

  // Inputs
  public readonly value: ModelSignal<string> = model<string>('');
  /** Colors offered as swatches, each in any notation `value` accepts. */
  public readonly colors: InputSignal<string[]> = input<string[]>([]);
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

  /**
   * The listbox's selection, as the subset of `colors` denoting the current
   * value — matching canonically, so notation differences don't break it.
   */
  protected readonly selectedColors: Signal<string[]> = computed(() => {
    const selected = canonicalHex(this.value());
    if (!selected) return [];
    return this.colors().filter(color => canonicalHex(color) === selected);
  });

  // Protected methods
  protected onSelectionChange(colors: string[]): void {
    if (this.notInteractive()) return;

    const color = colors[colors.length - 1];
    if (color === undefined) return;

    const hex = canonicalHex(color);
    if (!hex) return;

    this.value.set(hex);
    this.touched.set(true);
  }

  protected isSelected(color: string): boolean {
    const canonical = canonicalHex(color);
    if (!canonical) return false;
    return canonical === canonicalHex(this.value());
  }

  /** Black or white — whichever contrasts more with the swatch it sits on. */
  protected checkColor(color: string): string {
    const parsed = parseColor(color);
    if (!parsed) return '#ffffff';
    return contrastForeground(parsed);
  }
}

/** Lowercase `#rrggbb` (`#rrggbbaa` when translucent) form of any parseable color, or null. */
function canonicalHex(text: string): string | null {
  const parsed = parseColor(text);
  if (!parsed) return null;
  return rgbaToHex(parsed, parsed.alpha < 1);
}
