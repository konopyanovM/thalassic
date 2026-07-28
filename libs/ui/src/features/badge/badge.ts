import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
} from '@angular/core';
import { controlSize } from '../../types';
import { BADGE_CONFIG } from './badge.token';
import { badgeColor, badgePosition, badgeVariant } from './badge.types';

@Component({
  selector: 'tls-badge',
  imports: [],
  templateUrl: './badge.html',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Badge {
  // Injections
  private readonly _config = inject(BADGE_CONFIG);

  // Inputs
  public readonly value = input<number | string>();
  public readonly max: InputSignal<number> = input<number>(this._config.max);
  public readonly color: InputSignal<badgeColor> = input<badgeColor>(this._config.color);
  public readonly variant: InputSignal<badgeVariant> = input<badgeVariant>(this._config.variant);
  public readonly position: InputSignal<badgePosition> = input<badgePosition>(this._config.position);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly dot: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public readonly showZero: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public readonly hidden: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public readonly inset: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public readonly ariaLabel = input<string | undefined>(undefined);

  // Computed
  protected readonly visible = computed(() => {
    if (this.hidden()) return false;
    if (this.dot()) return true;

    const value = this.value();
    if (value === undefined || value === '') return false;
    if (typeof value === 'number' && value === 0 && !this.showZero()) return false;
    if (value === '0' && !this.showZero()) return false;

    return true;
  });

  protected readonly displayValue = computed(() => {
    if (this.dot()) return '';

    const value = this.value();
    if (typeof value === 'number' && value > this.max()) return `${this.max()}+`;

    return `${value}`;
  });

  protected readonly decorative = computed(() => {
    if (this.ariaLabel()) return false;
    return this.dot();
  });

  protected readonly hostClasses = computed(() => {
    const className = 'tls-badge';
    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);
    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.position()}`);
    array.push(`${className}--${this.size()}`);

    if (this.dot()) array.push(`${className}--dot`);
    if (this.inset()) array.push(`${className}--inset`);

    return array;
  });
}
