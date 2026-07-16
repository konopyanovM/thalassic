import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  TemplateRef,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { FormControlGroup } from '../../form-control-group';
import { Loader } from '../../loader';
import { PASSWORD_CONFIG } from './password.token';

@Component({
  selector: 'tls-password',
  templateUrl: './password.html',
  imports: [FormControlGroup, NgTemplateOutlet, Loader],
  host: {
    class: 'tls-password',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Password) }],
})
export class Password extends ValueFormControl<string> {
  private _config = inject(PASSWORD_CONFIG);

  override readonly supportsLabelFor = true;

  public readonly value: ModelSignal<string> = model<string>('');
  public readonly visible: ModelSignal<boolean> = model<boolean>(false);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  protected readonly showIconTemplate = contentChild<TemplateRef<unknown>>('showIcon');
  protected readonly hideIconTemplate = contentChild<TemplateRef<unknown>>('hideIcon');

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
