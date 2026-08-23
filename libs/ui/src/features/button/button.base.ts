import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
} from '@angular/core';
import { BUTTON_CONFIG } from './button.token';
import { controlSize } from '../../types';
import { buttonColor, buttonVariant } from './button.types';

@Directive({
  host: {
    '[class]': 'HOST_IS_CONTROL ? classes() : null',
    '[attr.aria-disabled]': 'HOST_IS_CONTROL ? ariaDisabled() : null',
  },
})
export abstract class ButtonBase {
  // Injections
  protected _config = inject(BUTTON_CONFIG);

  // Whether the host element is the interactive control itself. It is for a
  // directive applied to a native `button`; a component that renders its own
  // control inside places the classes and the ARIA state on that instead.
  protected HOST_IS_CONTROL = true;

  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Marks the button unavailable while leaving it focusable: it takes the
   * disabled treatment and `aria-disabled`, and refuses activation, but keeps
   * its place in the tab order.
   *
   * Reach for it over `disabled` wherever removing the control from the tab
   * order would strand focus — a control that becomes unavailable through its
   * own activation, such as a pager arrow at the end of its range, would
   * otherwise vanish from under the keyboard user who just pressed it. Plain
   * `disabled` remains the stronger choice everywhere else, since the platform
   * enforces it.
   */
  public readonly inactive: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  public readonly icon: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /**
   * Renders the button as a floating action button: a larger, elevated container for a
   * screen's single primary action. Composes with the other inputs — `icon` for the square
   * icon-only shape, a label for the extended form, `color`/`variant` for the treatment.
   * Placement (typically floating above other content) is the consumer's concern; the
   * input only changes the control's own geometry and elevation.
   */
  public readonly fab: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  public readonly color: InputSignal<buttonColor> = input<buttonColor>(this._config.color);
  public readonly variant: InputSignal<buttonVariant> = input<buttonVariant>(this._config.variant);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly rounded: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /** Whether the button stretches to fill its container's width. */
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  /** Whether the button refuses activation, for either reason. */
  public readonly unavailable = computed(() => this.disabled() || this.inactive());

  protected ariaDisabled = computed(() => (this.unavailable() ? 'true' : null));

  protected classes = computed(() => {
    const className = 'tls-button';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);
    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.size()}`);
    // One treatment for both: unavailability looks the same however it is enforced.
    if (this.unavailable()) array.push(`${className}--disabled`);
    if (this.icon()) array.push(`${className}--icon-only`);
    if (this.fab()) array.push(`${className}--fab`);
    if (this.fluid()) array.push(`${className}--fluid`);
    if (this.rounded()) array.push(`${className}--rounded`);

    return array;
  });
}
