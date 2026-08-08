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
import { Loader } from '../../loader';
import { textareaResize } from './textarea.config';
import { TEXTAREA_CONFIG } from './textarea.token';

@Component({
  selector: 'tls-textarea',
  imports: [Loader],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
  host: { class: 'tls-textarea' },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Textarea) }],
})
export class Textarea extends ValueFormControl<string> {
  // Injections
  private readonly _config = inject(TEXTAREA_CONFIG);

  override readonly supportsLabelFor = true;

  // Inputs
  public readonly value: ModelSignal<string> = model<string>('');
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
  public readonly autosize: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.autosize,
    { transform: booleanAttribute },
  );
  // Upper bound, in rows, on the autosized height. `0` grows without a cap.
  public readonly maxRows: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.maxRows,
    { transform: numberAttribute },
  );

  // Computed
  protected readonly classes: Signal<string[]> = computed(() => {
    const array: string[] = [this.CLASS_NAME];

    array.push(`${this.CLASS_NAME}--${this.size()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    if (this.autosize()) {
      array.push(`${this.CLASS_NAME}--autosize`);
      if (this.maxRows() > 0) array.push(`${this.CLASS_NAME}--autosize-capped`);
    }

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;

    this.value.set(target.value);
  }
}
