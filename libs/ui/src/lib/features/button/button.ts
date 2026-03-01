import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon';
import { buttonAppearance, buttonColor, buttonSize, buttonType } from './button.types';

@Component({
  selector: 'tls-button',
  imports: [Icon, NgTemplateOutlet],
  templateUrl: './button.html',
  host: {
    '[tabindex]': '-1',
  },
  styleUrls: ['./button.scss', './button-appearance.scss', 'button-color.scss', 'button-size.scss'],
})
export class Button implements OnInit {
  // Injections
  private _routerLink = inject(RouterLink, { optional: true });

  // Inputs
  public type: InputSignal<buttonType> = input<buttonType>('button');
  public disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public icon: InputSignalWithTransform<string | boolean, unknown> = input(false, {
    transform: (value: unknown) => {
      if (typeof value === 'string') return value;
      else return booleanAttribute(value);
    },
  });
  public color = input<buttonColor>('secondary');
  public appearance = input<buttonAppearance>('filled');
  public size: InputSignal<buttonSize> = input<buttonSize>('md');
  public href = input<string | null>(null);
  public tabindex = input<string>('0');

  protected hasRouterLink = Boolean(this._routerLink);

  // Computed
  protected isLink = computed<boolean>(() => Boolean(this._routerLink || this.href()));

  protected className = computed(() => {
    const className = 'tls-button';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);
    array.push(`${className}--${this.appearance()}`);
    array.push(`${className}--${this.size()}`);

    return array;
  });

  // Protected methods
  protected isIconString(icon: string | boolean): icon is string {
    return typeof icon === 'string';
  }

  // Lifecycle
  ngOnInit() {
    console.log(this._routerLink);
  }
}
