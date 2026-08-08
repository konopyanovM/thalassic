import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
} from '@angular/core';
import { radius } from '../../types';
import { SkeletonConfig } from './skeleton.config';
import { SKELETON_CONFIG } from './skeleton.token';

@Component({
  selector: 'tls-skeleton',
  imports: [],
  template: '',
  host: {
    '[class]': 'hostClasses()',
    '[style]': 'hostStyles()',
    'aria-hidden': 'true',
  },
})
export class Skeleton {
  // Injections
  private readonly _config: SkeletonConfig = inject(SKELETON_CONFIG);

  // Inputs
  public readonly size: InputSignal<number | string | null> = input<number | string | null>(this._config.size);
  public readonly width: InputSignal<number | string | null> = input<number | string | null>(this._config.width);
  public readonly height: InputSignal<number | string | null> = input<number | string | null>(this._config.height);
  public readonly radius: InputSignal<radius> = input<radius>(this._config.radius);
  public readonly duration: InputSignal<number> = input<number>(this._config.duration);
  public readonly rounded: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.rounded,
    { transform: booleanAttribute },
  );
  public readonly animate: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.animate,
    { transform: booleanAttribute },
  );

  // Computed
  protected readonly hostClasses = computed(() => {
    const className = 'tls-skeleton';
    const array: string[] = [className];

    if (!this.animate()) {
      array.push(`${className}--no-animate`);
    }

    return array;
  });

  protected readonly hostStyles = computed(() => {
    const size = this.size();
    const width = this.width() ?? size;
    const height = this.height() ?? size;

    return {
      '--tls-skeleton-width': this._resolveDimension(width),
      '--tls-skeleton-height': this._resolveDimension(height),
      '--tls-skeleton-radius': this.rounded() ? '50%' : `var(--radius-${this.radius()})`,
      '--tls-skeleton-duration': `${this.duration()}ms`,
    };
  });

  // Private methods
  private _resolveDimension(value: number | string | null): string {
    if (value === null) return '100%';
    if (typeof value === 'string') return value;
    return `${value}px`;
  }
}
