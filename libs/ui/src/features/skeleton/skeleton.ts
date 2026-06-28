import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
} from '@angular/core';
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
  private _config: SkeletonConfig = inject(SKELETON_CONFIG);

  public readonly size: InputSignal<number | string | null> = input<number | string | null>(this._config.size);
  public readonly width: InputSignal<number | string | null> = input<number | string | null>(this._config.width);
  public readonly height: InputSignal<number | string | null> = input<number | string | null>(this._config.height);
  public readonly radius: InputSignal<number> = input<number>(this._config.radius);
  public readonly duration: InputSignal<number> = input<number>(this._config.duration);
  public readonly rounded: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.rounded,
    { transform: booleanAttribute },
  );
  public readonly animate: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.animate,
    { transform: booleanAttribute },
  );

  protected hostClasses = computed(() => {
    const className = 'tls-skeleton';
    const array: string[] = [className];

    if (!this.animate()) {
      array.push(`${className}--no-animate`);
    }

    return array;
  });

  protected hostStyles = computed(() => {
    const size = this.size();
    const width = this.width() ?? size;
    const height = this.height() ?? size;
    const rounded = this.rounded();
    const radius = this.radius();

    return {
      '--tls-skeleton-width': this.resolveDimension(width),
      '--tls-skeleton-height': this.resolveDimension(height),
      '--tls-skeleton-radius': rounded ? '50%' : `${radius}px`,
      '--tls-skeleton-duration': `${this.duration()}ms`,
    };
  });

  private resolveDimension(value: number | string | null): string {
    if (value === null) return '100%';
    if (typeof value === 'string') return value;
    return `${value}px`;
  }
}
