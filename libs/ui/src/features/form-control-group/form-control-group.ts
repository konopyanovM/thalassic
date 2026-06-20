import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import { controlSize } from '../../types';
import { FormControlGroupConfig } from './form-control-group.config';
import { FORM_CONTROL_GROUP_CONFIG } from './form-control-group.token';

@Component({
  selector: 'tls-form-control-group',
  imports: [],
  template: '<ng-content></ng-content>',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class FormControlGroup {
  private _config: FormControlGroupConfig = inject(FORM_CONTROL_GROUP_CONFIG);

  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = 'tls-form-control-group';
    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);
    if (this.fluid()) array.push(`${className}--fluid`);

    return array;
  });
}
