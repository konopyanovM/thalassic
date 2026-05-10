import { Component, computed, inject, input, InputSignal } from '@angular/core';
import { LoaderConfig } from './loader.config';
import { LOADER_CONFIG } from './loader.token';
import { loaderSize } from './loader.types';

/**
 * Indeterminate spinner for indicating a loading state.
 *
 * @example
 * <!-- predefined size -->
 * <tls-loader size="lg" />
 *
 * @example
 * <!-- custom size in pixels -->
 * <tls-loader [size]="64" />
 *
 * @example
 * <!-- custom size with explicit stroke width -->
 * <tls-loader [size]="64" [width]="8" />
 */
@Component({
  selector: 'tls-loader',
  imports: [],
  template: '',
  host: {
    '[class]': 'hostClasses()',
    '[style]': 'hostStyles()',
    role: 'status',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class Loader {
  private _config: LoaderConfig = inject(LOADER_CONFIG);

  /** Predefined size token or custom pixel value. */
  public readonly size: InputSignal<loaderSize> = input<loaderSize>(this._config.size);
  /** Stroke width in pixels. Overrides the size-class default for both token and numeric sizes. */
  public readonly width: InputSignal<number | null> = input<number | null>(this._config.width);
  /** Divisor for auto stroke width when size is a number and width is null (`size / widthRatio`). */
  public readonly widthRatio: InputSignal<number> = input<number>(this._config.widthRatio);
  /** Text announced by screen readers via `aria-label`. */
  public readonly ariaLabel: InputSignal<string> = input<string>(this._config.ariaLabel);

  protected hostClasses = computed(() => {
    const className = 'tls-loader';
    const size = this.size();
    const array: string[] = [className];

    if (typeof size === 'string') {
      array.push(`${className}--${size}`);
    }

    return array;
  });

  protected hostStyles = computed(() => {
    const size = this.size();
    const width = this.width();

    if (typeof size === 'string' && width === null) {
      return null;
    }

    const styles: Record<string, string> = {};

    if (typeof size === 'number') {
      styles['--tls-loader-size'] = `${size}px`;
    }

    if (width !== null) {
      styles['--tls-loader-width'] = `${width}px`;
    } else {
      styles['--tls-loader-width'] = `${(size as number) / this.widthRatio()}px`;
    }

    return styles;
  });
}
