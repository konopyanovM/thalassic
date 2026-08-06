import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  numberAttribute,
  signal,
  Signal,
  TemplateRef,
  viewChildren,
  WritableSignal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { Icon } from '../../icon';
import { controlSize } from '../../../types';
import { RATING_CONFIG } from './rating.token';
import { ratingColor, RatingStarContext } from './rating.types';

/**
 * A star-rating control holding a number of stars, where 0 means unrated. Each
 * selectable increment (a whole star, or each half when `allowHalf` is on) is a
 * native radio positioned over its slice of the star row, so the group gets the
 * radio pattern's focus and arrow-key behaviour natively. The host is the
 * composite's `radiogroup` container and carries the group-level ARIA.
 */
@Component({
  selector: 'tls-rating',
  imports: [Icon, NgTemplateOutlet],
  templateUrl: './rating.html',
  styleUrl: './rating.scss',
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Rating) }],
  host: {
    role: 'radiogroup',
    '[class]': 'hostClasses()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
    '[attr.aria-required]': "required() ? 'true' : null",
    '[attr.aria-readonly]': "readonly() ? 'true' : null",
    '[attr.aria-busy]': "pending() ? 'true' : null",
    '(pointerleave)': 'onPointerLeave()',
  },
})
export class Rating extends ValueFormControl<number> {
  // Injections
  private readonly _config = inject(RATING_CONFIG);

  protected override CLASS_NAME = 'tls-rating';

  // Inputs
  public readonly value: ModelSignal<number> = model<number>(0);
  public readonly max: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.max,
    { transform: numberAttribute },
  );
  public readonly color: InputSignal<ratingColor> = input<ratingColor>(this._config.color);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);

  /** Offers half-star options: each star becomes two radios, one per half. */
  public readonly allowHalf: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.allowHalf,
    { transform: booleanAttribute },
  );

  /** Re-activating the currently selected option resets the value to 0 (unrated). */
  public readonly allowClear: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.allowClear,
    { transform: booleanAttribute },
  );

  /**
   * Renders the hover preview's *difference* from the committed value as a
   * translucent ghost: hovering above the value ghosts only the stars being
   * added, hovering below ghosts only the part being removed, and the solid
   * fill always shows the part both agree on.
   */
  public readonly preview: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.preview,
    { transform: booleanAttribute },
  );

  // State
  private static _counter = 0;

  /** Groups the radios when the consumer supplies no `name`; unique per instance. */
  private readonly _autoName = `tls-rating-${Rating._counter++}`;

  /** Option value previewed under the pointer, or null when nothing is hovered. */
  private readonly _hovered: WritableSignal<number | null> = signal<number | null>(null);

  /** Star currently playing the selection pop animation, or null. */
  private readonly _popped: WritableSignal<number | null> = signal<number | null>(null);

  /** Consumer-provided star slot rendered in place of the built-in star icon. */
  protected readonly starTemplate = contentChild<TemplateRef<RatingStarContext>>('starTemplate');

  /**
   * Activating an unchecked radio fires `change` then `click`; a click on the
   * already-checked one fires `click` alone. This flag marks the `change` so the
   * trailing `click` is not mistaken for a re-activation that should clear.
   */
  private _suppressClear = false;

  private readonly _inputs = viewChildren<ElementRef<HTMLInputElement>>('radio');

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed<string[]>(() => {
    const className = this.CLASS_NAME;

    const array: string[] = [`${className}--${this.size()}`, `${className}--${this.color()}`];

    return array.concat(this.controlClasses());
  });

  protected readonly stars: Signal<number[]> = computed<number[]>(() =>
    Array.from({ length: Math.max(0, Math.floor(this.max())) }, (_, index) => index + 1),
  );

  protected readonly radioName: Signal<string> = computed<string>(
    () => this.name() || this._autoName,
  );

  /**
   * Hovered option that should actually drive the preview: none while the
   * control is non-interactive, so a readonly/disabled flip mid-hover cannot
   * leave a stale preview on screen.
   */
  private readonly _previewedOption: Signal<number | null> = computed<number | null>(() =>
    this.notInteractive() ? null : this._hovered(),
  );

  // Protected methods
  /**
   * Solidly filled share of the given star, 0–100. Reads the hovered preview
   * when one is active, the committed value otherwise; a fractional value fills
   * its star partially, so a non-interactive rating can display an average like
   * 4.3. In ghost mode the solid fill shows only the part the committed value
   * and the hovered one agree on — the delta belongs to the ghost layer.
   */
  protected fillPercent(star: number): number {
    const hovered = this._previewedOption();
    const value = this.value();

    let display: number;
    if (hovered === null) display = value;
    else if (this.preview()) display = Math.min(value, hovered);
    else display = hovered;

    return this._starShare(display, star);
  }

  /**
   * Ghost-layer share of the given star, 0–100: reaches whichever of the
   * committed and hovered values is larger, so the part peeking out from under
   * the solid fill is exactly their difference — the stars a click would add,
   * or the part it would remove.
   */
  protected ghostPercent(star: number): number {
    const hovered = this._previewedOption();
    if (hovered === null) return 0;

    return this._starShare(Math.max(this.value(), hovered), star);
  }

  protected starLabel(option: number): string {
    return this._config.labels.star(option);
  }

  /** Whether the displayed value (hover preview first, else committed) fills the star only partially. */
  protected isHalf(star: number): boolean {
    const share = this._starShare(this._previewedOption() ?? this.value(), star);

    return share > 0 && share < 100;
  }

  protected onChange(option: number): void {
    // A radio has no native readonly, so a readonly (or disabled-but-still-
    // reachable) rating reverts the native check instead of committing it.
    if (this.notInteractive()) {
      this._syncNativeChecked();
      return;
    }

    this._suppressClear = true;
    this.value.set(option);
    this._pop(option);
  }

  protected isPopped(star: number): boolean {
    return this._popped() === star;
  }

  protected onPopAnimationEnd(star: number): void {
    if (this._popped() === star) this._popped.set(null);
  }

  protected onClick(option: number): void {
    if (this.notInteractive()) return;

    if (this._suppressClear) {
      this._suppressClear = false;
      return;
    }

    if (this.allowClear() && this.value() === option) this.value.set(0);
  }

  protected onPointerDown(): void {
    // A stale flag from an earlier keyboard arrow change would swallow the next
    // pointer click's clearing; a fresh pointer interaction starts clean.
    this._suppressClear = false;
  }

  protected onPointerEnter(option: number): void {
    if (this.notInteractive()) return;

    this._hovered.set(option);
  }

  protected onPointerLeave(): void {
    this._hovered.set(null);
  }

  // Private methods
  private _starShare(display: number, star: number): number {
    return Math.min(Math.max(display - (star - 1), 0), 1) * 100;
  }

  /**
   * Plays the selection pop on the star containing the committed option. When
   * that star is already popping (e.g. its other half was just selected), the
   * class is dropped for a frame and re-applied, so the animation restarts.
   */
  private _pop(option: number): void {
    const star = Math.ceil(option);

    if (this._popped() === star) {
      this._popped.set(null);
      requestAnimationFrame(() => this._popped.set(star));
      return;
    }

    this._popped.set(star);
  }

  /**
   * Restores every radio's native checked state from the model. Needed after a
   * reverted change: the browser has already moved the native check to the
   * activated radio, and the unchanged `checked` bindings won't move it back.
   */
  private _syncNativeChecked(): void {
    for (const inputRef of this._inputs()) {
      const element = inputRef.nativeElement;
      element.checked = Number(element.value) === this.value();
    }
  }
}
