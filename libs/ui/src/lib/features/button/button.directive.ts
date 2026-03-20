import { booleanAttribute, Directive, input, InputSignalWithTransform } from '@angular/core';
import { ButtonBase } from './button.base';

@Directive({
  selector: '[tlsButton]',
})
export class ButtonDirective extends ButtonBase {
  /**
   * Whether the button is in icon-only mode (uses a projected icon).
   * - `true` to render an icon-only button.
   * - `false` (default) to render a standard button with no icon-only styling.
   */
  public readonly icon: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
}
