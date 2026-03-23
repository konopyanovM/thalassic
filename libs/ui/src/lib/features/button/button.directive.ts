import { Directive } from '@angular/core';
import { ButtonBase } from './button.base';

@Directive({
  selector: '[tlsButton]',
})
export class ButtonDirective extends ButtonBase {}
