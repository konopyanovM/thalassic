import { computed, Directive, inject, input, InputSignal } from '@angular/core';
import { controlSize } from '../../types';
import { KBD_CONFIG } from './kbd.token';

@Directive({
  selector: 'kbd[tlsKbd]',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Kbd {
  // Injections
  private readonly _config = inject(KBD_CONFIG);

  // Inputs
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);

  // Computed
  protected readonly hostClasses = computed(() => {
    const className = 'tls-kbd';

    return [className, `${className}--${this.size()}`];
  });
}
