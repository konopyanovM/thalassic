import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import { INPUT_CONFIG } from './input.token';
import { controlSize } from '../../../types';

@Directive({
  selector: '[tlsInput]',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class InputDirective {
  // Injections
  private _config = inject(INPUT_CONFIG);

  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = 'tls-form-control';

    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);
    if (this.fluid()) array.push(`${className}--fluid`);

    return array;
  });
}
