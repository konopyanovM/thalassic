import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon';
import { BUTTON_CONFIG } from './button.token';
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
export class Button {
  // Injections
  private _routerLink = inject(RouterLink, { optional: true });
  private _config = inject(BUTTON_CONFIG);

  // Inputs
  public readonly label = input<string>();
  public readonly type: InputSignal<buttonType> = input<buttonType>(this._config.type);
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public readonly icon: InputSignalWithTransform<string | boolean, unknown> = input(false, {
    transform: (value: unknown) => {
      if (typeof value === 'string' && value === '') return true;
      else if (typeof value === 'string') return value;
      else return booleanAttribute(value);
    },
  });
  public readonly color: InputSignal<buttonColor> = input<buttonColor>(this._config.color);
  public readonly appearance: InputSignal<buttonAppearance> = input<buttonAppearance>(
    this._config.appearance,
  );
  public readonly size: InputSignal<buttonSize> = input<buttonSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly href = input<string | null>(null);
  public readonly tabindex = input<string>('0');

  // Computed
  protected isLink = computed<boolean>(() => Boolean(this._routerLink || this.href()));
  protected isIconString = computed<boolean>(() => typeof this.icon() === 'string');

  protected classes = computed(() => {
    const className = 'tls-button';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);
    array.push(`${className}--${this.appearance()}`);
    array.push(`${className}--${this.size()}`);
    if (this.disabled()) array.push(`${className}--disabled`);
    if (this.icon()) array.push(`${className}--icon-only`);
    if (this.fluid()) array.push(`${className}--fluid`);

    return array;
  });

  protected readonly String = String;
}
