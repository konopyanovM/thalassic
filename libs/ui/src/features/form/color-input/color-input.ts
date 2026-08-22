import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
  viewChild,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { ColorSwatch } from '../../color-swatch';
import { Popover } from '../../popover';
import { ColorPicker } from '../color-picker';
import { InputDirective } from '../input';
import { COLOR_PICKER_DEFAULT_VALUE } from '../color-picker/color-picker.constants';
import { COLOR_PICKER_CONFIG } from '../color-picker/color-picker.token';
import { colorFormat } from '../color-picker/color-picker.types';
import { parseColor, rgbaToHex } from '../color-picker/color.utils';
import { COLOR_INPUT_CONFIG } from './color-input.token';

/**
 * Color form field: a text input for typing a color (hex/rgb()/hsl(), always
 * committed as lowercase hex) with a swatch button on the inline-start that
 * opens a `tls-color-picker` panel in a popover. The panel and the field stay
 * live-synced while the popover is open.
 */
@Component({
  selector: 'tls-color-input',
  templateUrl: './color-input.html',
  styleUrl: './color-input.scss',
  imports: [ColorPicker, ColorSwatch, InputDirective, Popover],
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ColorInput) }],
})
export class ColorInput extends ValueFormControl<string> {
  // Injections
  private readonly _config = inject(COLOR_INPUT_CONFIG);
  private readonly _pickerConfig = inject(COLOR_PICKER_CONFIG);

  override readonly supportsLabelFor = true;

  // Inputs
  public readonly value: ModelSignal<string> = model<string>('');
  /** Enables the alpha slider in the panel; committed hex gains an alpha channel. */
  public readonly alpha: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  /** Hex colors offered as one-tap swatches inside the panel. */
  public readonly presets: InputSignal<string[]> = input<string[]>([]);
  /** Notations the panel's readout may display; forwarded to the embedded picker. */
  public readonly formats: InputSignal<colorFormat[]> = input<colorFormat[]>(
    this._pickerConfig.formats,
  );
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  // View children
  private readonly _popoverComponent: Signal<Popover | undefined> =
    viewChild<Popover>('popoverRef');
  private readonly _trigger: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('triggerRef');

  // State
  protected readonly labels = this._config.labels;

  // Computed
  /** An empty or unparsable value renders as a fully transparent swatch. */
  protected readonly swatchColor: Signal<string> = computed(() => {
    const parsed = parseColor(this.value());
    if (!parsed) return '#ffffff00';
    return rgbaToHex(parsed, this.alpha());
  });

  /** The panel needs a concrete color to start from even while the field is empty. */
  protected readonly pickerValue: Signal<string> = computed(() => {
    const parsed = parseColor(this.value());
    if (!parsed) return COLOR_PICKER_DEFAULT_VALUE;
    return this.value();
  });

  // Public methods
  public override activate(): void {
    this.focus();
    if (this.notInteractive()) return;

    const popover = this._popoverComponent();
    if (!popover) return;
    popover.open(this._trigger().nativeElement);
  }

  // Protected methods
  protected onPickerValueChange(next: string): void {
    this.value.set(next);
  }

  protected onFieldKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this._commitField(event.target as HTMLInputElement);
  }

  protected onFieldBlur(event: Event): void {
    this._commitField(event.target as HTMLInputElement);
    this.touched.set(true);
  }

  // Private methods
  private _commitField(field: HTMLInputElement): void {
    const parsed = parseColor(field.value);
    if (parsed) {
      this.value.set(rgbaToHex(parsed, this.alpha()));
    } else if (field.value.trim() === '') {
      this.value.set('');
    }
    // Re-sync the field imperatively: after a revert (or a commit that
    // normalizes the text) the bound signal may not change, so the binding
    // alone would leave the stale text in place.
    field.value = this.value();
  }
}
