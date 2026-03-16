import { computed, Directive, input, InputSignal, Signal } from '@angular/core';
import { inputSize } from './input.types';

@Directive({
  selector: '[tlsInput]',
  host: {
    '[class]': 'classes()',
  },
})
export class InputDirective {
  public readonly size: InputSignal<inputSize> = input<inputSize>('md');

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = 'tls-form-control';

    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);

    return array;
  });
}
