import { Directionality } from '@angular/cdk/bidi';
import {
  booleanAttribute,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
  signal,
  untracked,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { ButtonDirective } from '../../button';
import { ColorSwatch } from '../../color-swatch';
import { Icon } from '../../icon';
import { ALPHA_MAX, ColorRange } from '../color-range';
import { ColorSwatchPicker } from '../color-swatch-picker';
import { InputDirective } from '../input';
import {
  COLOR_PICKER_DEFAULT_VALUE,
  SV_KEYBOARD_STEP,
  SV_KEYBOARD_STEP_LARGE,
} from './color-picker.constants';
import { COLOR_PICKER_CONFIG } from './color-picker.token';
import { colorFormat, EyeDropperConstructor, Hsva } from './color-picker.types';
import {
  formatHsl,
  formatRgb,
  hsvToHsl,
  hsvToRgb,
  parseColor,
  rgbaToHex,
  rgbToHsv,
} from './color.utils';

/**
 * Standalone color panel: a 2-D saturation/brightness surface, hue and
 * (opt-in) alpha sliders, an editable readout that accepts hex/rgb()/hsl()
 * notation, preset swatches, and — where the platform offers one — an
 * eyedropper. Reads and writes a lowercase hex string (`#rrggbb`, or
 * `#rrggbbaa` when `alpha` is enabled) while holding its working state in HSV,
 * so the chosen hue survives passes through black, white, and gray.
 */
@Component({
  selector: 'tls-color-picker',
  imports: [ButtonDirective, ColorRange, ColorSwatch, ColorSwatchPicker, Icon, InputDirective],
  templateUrl: './color-picker.html',
  host: {
    role: 'group',
    '[class]': 'hostClasses()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ColorPicker) }],
})
export class ColorPicker extends ValueFormControl<string> {
  // Injections
  private readonly _config = inject(COLOR_PICKER_CONFIG);
  private readonly _directionality = inject(Directionality);

  protected override readonly CLASS_NAME = 'tls-color-picker';

  // Inputs
  public readonly value: ModelSignal<string> = model<string>(COLOR_PICKER_DEFAULT_VALUE);
  /** Enables the alpha slider; the emitted hex gains an alpha channel (`#rrggbbaa`). */
  public readonly alpha: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  /**
   * Notations the readout may display, in cycle order; the first entry is the
   * starting format. A single entry pins the readout and hides the toggle.
   */
  public readonly formats: InputSignal<colorFormat[]> = input<colorFormat[]>(this._config.formats);
  /** Hex colors offered as one-tap swatches below the readout. */
  public readonly presets: InputSignal<string[]> = input<string[]>([]);

  // View children
  private readonly _svThumb: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('svThumb');
  private readonly _svArea: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('svArea');

  // State
  private readonly _chosenFormat: WritableSignal<colorFormat | null> = signal(null);
  protected readonly labels = this._config.labels;
  /** Present only while the platform implements the EyeDropper API. */
  protected readonly supportsEyeDropper =
    typeof (globalThis as { EyeDropper?: unknown }).EyeDropper === 'function';

  private readonly _hsv: WritableSignal<Hsva> = signal({
    hue: 0,
    saturation: 0,
    value: 0,
    alpha: 1,
  });
  private readonly _dragging: WritableSignal<boolean> = signal(false);
  /** Guards the value→HSV sync against re-parsing a hex this picker just emitted. */
  private _lastEmittedHex: string | null = null;

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() =>
    [this.CLASS_NAME, `${this.CLASS_NAME}--${this.size()}`].concat(this.controlClasses()),
  );

  protected readonly hue: Signal<number> = computed(() => Math.round(this._hsv().hue));
  protected readonly alphaPercent: Signal<number> = computed(() =>
    Math.round(this._hsv().alpha * ALPHA_MAX),
  );
  protected readonly saturationPercent: Signal<number> = computed(() =>
    Math.round(this._hsv().saturation * 100),
  );
  protected readonly brightnessPercent: Signal<number> = computed(() =>
    Math.round(this._hsv().value * 100),
  );

  protected readonly hex: Signal<string> = computed(() =>
    rgbaToHex(hsvToRgb(this._hsv()), this.alpha()),
  );

  /** Fully saturated, fully bright color of the current hue — the SV area's base tint. */
  protected readonly hueColor: Signal<string> = computed(() =>
    rgbaToHex(hsvToRgb({ hue: this._hsv().hue, saturation: 1, value: 1, alpha: 1 })),
  );

  /** The picked color at full opacity — what the alpha slider fades up to. */
  protected readonly opaqueColor: Signal<string> = computed(() =>
    rgbaToHex(hsvToRgb({ ...this._hsv(), alpha: 1 })),
  );

  protected readonly svValueText: Signal<string> = computed(
    () => `Saturation ${this.saturationPercent()}%, brightness ${this.brightnessPercent()}%`,
  );

  /** The toggled format while it stays allowed; otherwise the first allowed one. */
  protected readonly activeFormat: Signal<colorFormat> = computed(() => {
    const formats = this.formats();
    const chosen = this._chosenFormat();
    if (chosen && formats.includes(chosen)) return chosen;
    return formats[0] ?? 'hex';
  });

  protected readonly readoutText: Signal<string> = computed(() => {
    const format = this.activeFormat();
    if (format === 'rgb') return formatRgb(hsvToRgb(this._hsv()));
    if (format === 'hsl') return formatHsl(hsvToHsl(this._hsv()));
    return this.hex();
  });

  // Readonly keeps the thumb focusable — the keydown handler blocks edits —
  // so its value stays reachable and announcable; only disabled removes it
  // from the tab order.
  protected readonly tabindex: Signal<number> = computed(() => (this.disabled() ? -1 : 0));

  constructor() {
    super();

    effect(() => {
      const incoming = this.value();
      if (incoming === this._lastEmittedHex) return;
      const parsed = parseColor(incoming);
      if (!parsed) return;
      untracked(() => this._hsv.set(rgbToHsv(parsed)));
    });
  }

  // Protected methods
  protected onSvPointerDown(event: PointerEvent): void {
    if (this.notInteractive()) return;
    // Ignore non-primary mouse buttons; touch/pen report button 0.
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    event.preventDefault();

    // `preventDefault` suppresses the default focus, so focus the thumb
    // explicitly — otherwise the arrow keys wouldn't work after a pointer drag.
    this._svThumb().nativeElement.focus();

    this._dragging.set(true);
    this._svArea().nativeElement.setPointerCapture(event.pointerId);
    this._updateFromPointer(event);
  }

  protected onSvPointerMove(event: PointerEvent): void {
    if (!this._dragging()) return;
    this._updateFromPointer(event);
  }

  protected onSvPointerUp(event: PointerEvent): void {
    if (!this._dragging()) return;

    this._svArea().nativeElement.releasePointerCapture(event.pointerId);
    this._dragging.set(false);
  }

  // Pointer capture is already released once the browser cancels the pointer, so
  // this only resets drag state (calling `releasePointerCapture` here can throw).
  protected onSvPointerCancel(): void {
    this._dragging.set(false);
  }

  protected onSvKeydown(event: KeyboardEvent): void {
    if (this.notInteractive()) return;

    const step = event.shiftKey ? SV_KEYBOARD_STEP_LARGE : SV_KEYBOARD_STEP;
    const rtl = this._directionality.value === 'rtl';
    const hsv = this._hsv();

    let saturation = hsv.saturation;
    let brightness = hsv.value;

    switch (event.key) {
      case 'ArrowLeft':
        saturation += rtl ? step : -step;
        break;
      case 'ArrowRight':
        saturation += rtl ? -step : step;
        break;
      case 'ArrowUp':
        brightness += step;
        break;
      case 'ArrowDown':
        brightness -= step;
        break;
      case 'Home':
        saturation = 0;
        brightness = 1;
        break;
      case 'End':
        saturation = 1;
        brightness = 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this._commit({
      ...hsv,
      saturation: clampRatio(saturation),
      value: clampRatio(brightness),
    });
  }

  protected onHueChange(hue: number): void {
    this._commit({ ...this._hsv(), hue });
  }

  protected onAlphaChange(percent: number): void {
    this._commit({ ...this._hsv(), alpha: percent / ALPHA_MAX });
  }

  protected onReadoutKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this._commitReadout(event.target as HTMLInputElement);
  }

  protected onReadoutBlur(event: Event): void {
    this._commitReadout(event.target as HTMLInputElement);
    this.touched.set(true);
  }

  protected cycleFormat(): void {
    const formats = this.formats();
    if (formats.length < 2) return;
    const next = formats[(formats.indexOf(this.activeFormat()) + 1) % formats.length];
    this._chosenFormat.set(next);
  }

  protected onPresetChange(preset: string): void {
    const parsed = parseColor(preset);
    if (!parsed) return;
    this._commit(rgbToHsv(parsed));
  }

  protected async openEyeDropper(): Promise<void> {
    if (this.notInteractive()) return;

    const EyeDropperClass = (globalThis as unknown as { EyeDropper: EyeDropperConstructor })
      .EyeDropper;
    try {
      const result = await new EyeDropperClass().open();
      const parsed = parseColor(result.sRGBHex);
      if (!parsed) return;
      this._commit({ ...rgbToHsv(parsed), alpha: this._hsv().alpha });
    } catch {
      // The user dismissed the eyedropper; nothing to commit.
    }
  }

  // Private methods
  private _commit(hsv: Hsva): void {
    this._hsv.set(hsv);
    const hex = rgbaToHex(hsvToRgb(hsv), this.alpha());
    this._lastEmittedHex = hex;
    this.value.set(hex);
  }

  private _commitReadout(field: HTMLInputElement): void {
    const parsed = parseColor(field.value);
    if (parsed) {
      this._commit(rgbToHsv(parsed));
    }
    // Re-sync the field imperatively: after a revert (or a commit that
    // normalizes the text) the bound signal may not change, so the binding
    // alone would leave the stale text in place.
    field.value = this.readoutText();
  }

  private _updateFromPointer(event: PointerEvent): void {
    const rect = this._svArea().nativeElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    let ratioX = (event.clientX - rect.left) / rect.width;
    if (this._directionality.value === 'rtl') ratioX = 1 - ratioX;
    const ratioY = (event.clientY - rect.top) / rect.height;

    this._commit({
      ...this._hsv(),
      saturation: clampRatio(ratioX),
      value: clampRatio(1 - ratioY),
    });
  }
}

function clampRatio(ratio: number): number {
  return Math.min(1, Math.max(0, ratio));
}
