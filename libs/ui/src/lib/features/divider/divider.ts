import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
} from '@angular/core';
import { DividerConfig } from './divider.config';
import { DIVIDER_CONFIG } from './divider.token';
import { dividerContentPosition, dividerOrientation, dividerVariant } from './divider.types';

@Component({
  selector: 'tls-divider',
  imports: [],
  templateUrl: './divider.html',
  styleUrl: './divider.scss',
  host: {
    role: 'separator',
    '[aria-orientation]': 'orientation()',
    '[class]': 'hostClasses()',
  },
})
export class Divider {
  private _config: DividerConfig = inject(DIVIDER_CONFIG);

  public orientation: InputSignal<dividerOrientation> = input<dividerOrientation>(
    this._config.orientation,
  );
  public position: InputSignal<dividerContentPosition> = input<dividerContentPosition>(
    this._config.position,
  );
  public variant: InputSignal<dividerVariant> = input<dividerVariant>(this._config.variant);
  public flush: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.flush,
    { transform: booleanAttribute },
  );

  protected hostClasses = computed(() => {
    const className = 'tls-divider';

    const array: string[] = [className];

    array.push(`${className}--${this.orientation()}`);
    array.push(`${className}--${this.position()}`);
    array.push(`${className}--${this.variant()}`);
    if (this.flush()) array.push(`${className}--flush`);

    return array;
  });
}
