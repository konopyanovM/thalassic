import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
} from '@angular/core';
import { buttonColor } from '../button/button.types';
import { AlertConfig } from './alert.config';
import { ALERT_CONFIG } from './alert.token';

@Component({
  selector: 'tls-alert',
  imports: [],
  templateUrl: './alert.html',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Alert {
  private _config: AlertConfig = inject(ALERT_CONFIG);

  public readonly color: InputSignal<buttonColor> = input<buttonColor>(this._config.color);
  public readonly label: InputSignal<string | null> = input<string | null>(
    typeof this._config.label === 'string' ? this._config.label : null,
  );
  public readonly hideLabel: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.hideLabel,
    { transform: booleanAttribute },
  );

  protected displayLabel = computed(() => {
    const label = this.label();
    if (label) return label;

    if (typeof this._config.label === 'object') {
      return this._config.label[this.color()];
    }
    
    return '';
  });

  protected hostClasses = computed(() => {
    const className = 'tls-alert';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);

    return array;
  });
}
