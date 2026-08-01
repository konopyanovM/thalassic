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
import { CheckboxFormControl, FORM_CONTROL } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { TOGGLE_BUTTON_CONFIG } from './toggle-button.token';
import { toggleButtonColor, toggleButtonVariant } from './toggle-button.types';

/**
 * A standalone two-state button following the WAI-ARIA toggle-button pattern
 * (`role="button"` + `aria-pressed`). The host element is the control itself.
 * For a set of mutually related options use `tls-toggle-group` instead.
 *
 * `color`/`variant` style the resting (unpressed) state. The pressed state
 * defaults to the filled treatment of the base hue and can be restyled
 * independently via `checkedColor`/`checkedVariant`, mirroring `tlsChipControl`.
 */
@Component({
  selector: 'tls-toggle-button',
  templateUrl: './toggle-button.html',
  host: {
    role: 'button',
    '[class]': 'hostClasses()',
    '[tabindex]': 'disabled() ? -1 : tabindex()',
    '[attr.id]': 'effectiveInputId()',
    '[attr.aria-pressed]': 'ariaPressed()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
    '(click)': 'toggle()',
    '(blur)': 'touched.set(true)',
    '(keydown.space)': 'onKeyboardToggle($event)',
    '(keydown.enter)': 'onKeyboardToggle($event)',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ToggleButton) }],
})
export class ToggleButton extends CheckboxFormControl {
  // Injections
  private readonly _config = inject(TOGGLE_BUTTON_CONFIG);

  protected override CLASS_NAME = 'tls-toggle-button';

  // Inputs
  /** Whether the button is in the pressed (on) state. */
  public readonly checked: ModelSignal<boolean> = model<boolean>(false);

  /** The text label displayed inside the button. Takes priority over projected content. */
  public readonly label = input<string>();

  /**
   * Label displayed instead of `label` while pressed (e.g. "Mute" / "Muted").
   * Providing it also switches the announcement strategy: the state is conveyed
   * by the changing accessible name alone and `aria-pressed` is omitted, per the
   * WAI-ARIA toggle-button pattern (a name that changes with state must not be
   * combined with `aria-pressed`, or screen readers announce both).
   */
  public readonly checkedLabel = input<string>();

  /**
   * Keeps the button's width constant across states by reserving space for the
   * wider of `label` / `checkedLabel`, so toggling never shifts the surrounding
   * layout. Applies only when both labels are provided.
   */
  public readonly staticWidth: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /**
   * Marks the content as icon-only: the button becomes square with centered
   * content. Provide an accessible name via `ariaLabel`/`ariaLabelledby`, since
   * there is no visible text for screen readers to announce.
   */
  public readonly icon: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  public readonly color: InputSignal<toggleButtonColor> = input<toggleButtonColor>(
    this._config.color,
  );
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly variant: InputSignal<toggleButtonVariant> = input<toggleButtonVariant>(
    this._config.variant,
  );

  /** Hue of the pressed state; `undefined` keeps the base `color`. */
  public readonly checkedColor: InputSignal<toggleButtonColor | undefined> = input<
    toggleButtonColor | undefined
  >(this._config.checkedColor);

  /** Treatment of the pressed state; `undefined` uses the filled treatment. */
  public readonly checkedVariant: InputSignal<toggleButtonVariant | undefined> = input<
    toggleButtonVariant | undefined
  >(this._config.checkedVariant);

  /** Whether the button stretches to fill its container's width. */
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  public readonly tabindex: InputSignal<string | number> = input<string | number>(0);

  // Computed
  /** Label for the current state: `checkedLabel` while pressed (when provided), `label` otherwise. */
  protected readonly displayedLabel: Signal<string | undefined> = computed<string | undefined>(
    () => {
      const checkedLabel = this.checkedLabel();
      if (this.checked() && checkedLabel) return checkedLabel;

      return this.label();
    },
  );

  /** Whether both state labels render stacked in one cell, sizing the button to the wider one. */
  protected readonly stackedLabels: Signal<boolean> = computed<boolean>(() =>
    Boolean(this.staticWidth() && this.label() && this.checkedLabel()),
  );

  /** `aria-pressed` value; omitted entirely when `checkedLabel` makes the name carry the state. */
  protected readonly ariaPressed: Signal<boolean | null> = computed<boolean | null>(() =>
    this.checkedLabel() ? null : this.checked(),
  );

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;

    const array: string[] = [
      className,
      `${className}--${this.color()}`,
      `${className}--${this.size()}`,
      `${className}--${this.variant()}`,
    ];

    if (this.fluid()) array.push(`${className}--fluid`);
    if (this.icon()) array.push(`${className}--icon-only`);

    if (this.checked()) {
      const checkedColor = this.checkedColor();
      if (checkedColor) array.push(`${className}--checked-${checkedColor}`);

      const checkedVariant = this.checkedVariant();
      if (checkedVariant) array.push(`${className}--checked-${checkedVariant}`);
    }

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected toggle() {
    if (this.notInteractive()) return;

    this.checked.update(previous => !previous);
  }

  protected onKeyboardToggle(event: Event) {
    event.preventDefault();
    this.toggle();
  }
}
