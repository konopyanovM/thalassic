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
import { ButtonBase } from './button.base';
import { buttonType } from './button.types';

@Component({
  selector: 'tls-button',
  imports: [Icon, NgTemplateOutlet],
  templateUrl: './button.html',
  host: {
    '[tabindex]': '-1',
  },
  styleUrl: './button.scss',
})
export class Button extends ButtonBase {
  // Injections
  private _routerLink = inject(RouterLink, { optional: true });

  protected override APPLY_HOST_CLASSES = false;

  // Inputs
  /** The text label displayed inside the button. Takes priority over projected content. */
  public readonly label = input<string>();

  public readonly type: InputSignal<buttonType> = input<buttonType>(this._config.type);

  /**
   * Icon to display on the button. Accepts:
   * - A string icon name to render a specific icon.
   * - An empty string or boolean `true` to render an icon-only button (using a projected icon).
   * - `false` to render no icon.
   */
  public override readonly icon: InputSignalWithTransform<string | boolean, unknown> = input(
    false,
    {
      transform: (value: unknown) => {
        if (typeof value === 'string' && value === '') return true;
        else if (typeof value === 'string') return value;
        else return booleanAttribute(value);
      },
    },
  );

  /** An optional URL that causes the button to render as an anchor link. */
  public readonly href = input<string | null>(null);
  public readonly tabindex = input<string>('0');

  // Computed
  protected isLink = computed<boolean>(() => Boolean(this._routerLink || this.href()));
  protected isIconString = computed<boolean>(() => typeof this.icon() === 'string');

  protected readonly String = String;
}
