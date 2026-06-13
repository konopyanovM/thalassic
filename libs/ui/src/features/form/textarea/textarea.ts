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
  numberAttribute,
  Signal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { textareaResize } from './textarea.config';
import { TEXTAREA_CONFIG } from './textarea.token';

@Component({
  selector: 'tls-textarea',
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
  host: { class: 'tls-textarea' },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Textarea) }],
})
export class Textarea extends ValueFormControl<string> {
  private _config = inject(TEXTAREA_CONFIG);

  public readonly value: ModelSignal<string> = model<string>('');
  public readonly inputId = input<string | null>(null);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly rows: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.rows,
    { transform: numberAttribute },
  );
  public readonly resize: InputSignal<textareaResize> = input<textareaResize>(this._config.resize);

  protected readonly classes: Signal<string[]> = computed(() => {
    const array: string[] = [this.CLASS_NAME];

    array.push(`${this.CLASS_NAME}--${this.size()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;

    this.value.set(target.value);
  }
}
