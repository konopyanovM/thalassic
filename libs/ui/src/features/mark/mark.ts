import { computed, Directive, inject, input, InputSignal } from '@angular/core';
import { color } from '../../types';
import { MARK_CONFIG } from './mark.token';

@Directive({
  selector: 'mark[tlsMark]',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Mark {
  // Injections
  private readonly _config = inject(MARK_CONFIG);

  // Inputs
  public readonly color: InputSignal<color> = input<color>(this._config.color);

  // Computed
  protected readonly hostClasses = computed(() => {
    const className = 'tls-mark';

    return [className, `${className}--${this.color()}`];
  });
}
