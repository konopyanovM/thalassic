import { Component, computed, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';
import { ValueFormControl } from '../../../abstract';
import { inputSize } from '../input/input.types';

@Component({
  selector: 'tls-password',
  templateUrl: './password.html',
  styleUrl: './password.scss',
  host: {
    '[class]': 'classes()',
  },
})
export class Password extends ValueFormControl<string> {
  public readonly value: ModelSignal<string> = model<string>('');
  public readonly visible: ModelSignal<boolean> = model<boolean>(false);
  public readonly inputId = input<string | null>(null);
  public readonly placeholder = input<string>('');
  public readonly size: InputSignal<inputSize> = input<inputSize>('md');

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = 'tls-form-field-group';

    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);

    return array.concat(this.controlClasses());
  });

  protected type = computed(() => (this.visible() ? 'text' : 'password'));

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;

    this.value.set(target.value);
  }

  protected toggle() {
    if (this.notInteractive()) return;

    this.visible.update(prev => !prev);
  }
}
