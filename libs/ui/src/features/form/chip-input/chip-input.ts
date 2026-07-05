import {
  booleanAttribute,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  signal,
  Signal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { Chip } from '../../chip';
import { CHIP_INPUT_CONFIG } from './chip-input.token';

@Component({
  selector: 'tls-chip-input',
  templateUrl: './chip-input.html',
  imports: [Chip],
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ChipInput) }],
  host: { '[class]': 'classes()' },
})
export class ChipInput extends ValueFormControl<string[]> {
  private readonly _config = inject(CHIP_INPUT_CONFIG);

  public readonly value: ModelSignal<string[]> = model<string[]>([]);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly separator: InputSignal<string[]> = input<string[]>(this._config.separator);

  protected readonly inputValue = signal('');

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;

    const array = [className, `${className}--${this.size()}`];
    if (this.fluid()) array.push(`${className}--fluid`);

    return array.concat(this.controlClasses());
  });

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.inputValue.set(target.value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.notInteractive()) return;

    if (this.separator().includes(event.key)) {
      event.preventDefault();
      this._addChip();
      return;
    }

    if (event.key === 'Backspace' && !this.inputValue()) {
      this.value.update(chips => chips.slice(0, -1));
    }
  }

  protected removeChip(index: number): void {
    if (this.notInteractive()) return;
    this.value.update(chips => chips.filter((_chip, chipIndex) => chipIndex !== index));
  }

  private _addChip(): void {
    const text = this.inputValue().trim();
    if (!text || this.notInteractive()) return;
    this.value.update(chips => [...chips, text]);
    this.inputValue.set('');
  }
}
