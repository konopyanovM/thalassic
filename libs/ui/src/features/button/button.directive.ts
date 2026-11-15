import { Directive } from '@angular/core';
import { ButtonBase } from './button.base';

@Directive({
  selector: '[tlsButton]',
  // The host is the control, so it carries the block class from creation, before the bound
  // modifiers arrive.
  host: { class: 'tls-button' },
})
export class ButtonDirective extends ButtonBase {}
