import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
} from '@angular/core';
import { RADIUS_TOKENS } from '../../constants';
import { radiusValue } from '../../types';
import { SkeletonConfig } from './skeleton.config';
import { SKELETON_CONFIG } from './skeleton.token';

/**
 * A placeholder drawn where content is still on its way. By default it is a
 * box of the given size; as `text` it is one line of the text it stands in
 * for; wrapped around content it is exactly the size of that content, which
 * keeps its place unseen until `loading` is turned off.
 */
@Component({
  selector: 'tls-skeleton',
  imports: [],
  template: '<ng-content />',
  host: {
    class: 'tls-skeleton',
    '[class]': 'hostClasses()',
    '[style]': 'hostStyles()',
    '[attr.aria-hidden]': 'loading() ? true : null',
  },
})
export class Skeleton {
  // Injections
  private readonly _config: SkeletonConfig = inject(SKELETON_CONFIG);

  // Inputs
  public readonly size: InputSignal<number | string | null> = input<number | string | null>(this._config.size);
  public readonly width: InputSignal<number | string | null> = input<number | string | null>(this._config.width);
  public readonly height: InputSignal<number | string | null> = input<number | string | null>(this._config.height);
  public readonly radius: InputSignal<radiusValue> = input<radiusValue>(this._config.radius);
  public readonly duration: InputSignal<number> = input<number>(this._config.duration);
  public readonly rounded: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.rounded,
    { transform: booleanAttribute },
  );
  public readonly animate: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.animate,
    { transform: booleanAttribute },
  );
  /**
   * Whether there is still something to wait for. Turned off, the skeleton
   * draws nothing and takes no part in layout, so content wrapped in it stands
   * exactly as it would alone: the wrapper can stay in the template and be
   * switched, rather than the content being written out a second time.
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });
  /**
   * Stands in for one line of text: the skeleton takes the line height of the
   * font it inherits and draws a bar the height of that font's glyphs, so the
   * text replacing it lands in the same line box. Placed inside the element
   * that will hold the text, or given that element's class, it follows the
   * typography with no size of its own to keep in step. `width` sets the
   * line's length, in any unit (`12ch`, `60%`); `height`, `size`, `radius` and
   * `rounded` do not apply, since the bar is proportioned from the font.
   */
  public readonly text: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  // Computed
  protected readonly hostClasses = computed(() => {
    const className = 'tls-skeleton';
    const array: string[] = [className];

    if (!this.animate()) {
      array.push(`${className}--no-animate`);
    }

    if (this.text()) {
      array.push(`${className}--text`);
    }

    if (!this.loading()) {
      array.push(`${className}--idle`);
    }

    return array;
  });

  protected readonly hostStyles = computed(() => {
    const duration = `${this.duration()}ms`;

    // A line of text is sized by its font, so only its length is passed on.
    if (this.text()) {
      return {
        '--tls-skeleton-width': this._resolveDimension(this.width()),
        '--tls-skeleton-duration': duration,
      };
    }

    const size = this.size();
    const width = this.width() ?? size;
    const height = this.height() ?? size;

    return {
      '--tls-skeleton-width': this._resolveDimension(width),
      '--tls-skeleton-height': this._resolveDimension(height),
      '--tls-skeleton-radius': this.rounded() ? '50%' : this._resolveRadius(this.radius()),
      '--tls-skeleton-duration': duration,
    };
  });

  // Private methods
  private _resolveDimension(value: number | string | null): string {
    if (value === null) return '100%';
    if (typeof value === 'string') return value;
    return `${value}px`;
  }

  private _resolveRadius(value: radiusValue): string {
    if (typeof value === 'number') return `${value}px`;
    if (RADIUS_TOKENS.some(token => token === value)) return `var(--radius-${value})`;
    return value;
  }
}
