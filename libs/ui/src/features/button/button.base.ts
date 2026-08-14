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
    '[class]': 'APPLY_HOST_CLASSES ? classes() : null',
  },
})
export abstract class ButtonBase {
  // Injections
  protected _config = inject(BUTTON_CONFIG);

  protected APPLY_HOST_CLASSES = true;

  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

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
  public readonly fab: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

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

  protected classes = computed(() => {
    const className = 'tls-button';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);
    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.size()}`);
    if (this.disabled()) array.push(`${className}--disabled`);
    if (this.icon()) array.push(`${className}--icon-only`);
    if (this.fab()) array.push(`${className}--fab`);
    if (this.fluid()) array.push(`${className}--fluid`);
    if (this.rounded()) array.push(`${className}--rounded`);

    return array;
  });
}
