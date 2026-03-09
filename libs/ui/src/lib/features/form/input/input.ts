import { Component, computed, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';
import { ValueFormControl } from '../../../abstract';
import { inputSize } from './input.types';

@Component({
  selector: 'tls-input',
  imports: [],
  templateUrl: './input.html',
  styleUrls: ['./input.scss', './input-size.scss'],
})
export class Input extends ValueFormControl<string> {
  public readonly value: ModelSignal<string> = model<string>('');
  public readonly inputId = input<string | null>(null);
  public readonly placeholder = input<string>('');
  public readonly size: InputSignal<inputSize> = input<inputSize>('md');

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = 'tls-input';

    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;

    this.value.set(target.value);
  }
}
