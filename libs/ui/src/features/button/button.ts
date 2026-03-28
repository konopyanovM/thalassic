import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, InputSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonBase } from './button.base';
import { buttonType } from './button.types';

@Component({
  selector: 'tls-button',
  imports: [NgTemplateOutlet],
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

  /** An optional URL that causes the button to render as an anchor link. */
  public readonly href = input<string | null>(null);
  public readonly tabindex = input<string>('0');

  // Computed
  protected isLink = computed<boolean>(() => Boolean(this._routerLink || this.href()));
}
