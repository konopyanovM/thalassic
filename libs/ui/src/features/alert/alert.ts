import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { Icon, systemIcon } from '../icon';
import { AlertIcon } from './alert-icon';
import { AlertConfig } from './alert.config';
import { alertColor } from './alert.types';
import { ALERT_CONFIG } from './alert.token';

@Component({
  selector: 'tls-alert',
  imports: [Icon],
  templateUrl: './alert.html',
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'hostRole()',
    '[attr.aria-label]': 'hideLabel() ? displayLabel() : null',
    'animate.enter': 'tls-alert--enter',
    'animate.leave': 'tls-alert--leave',
  },
})
export class Alert {
  // Injections
  private readonly _config: AlertConfig = inject(ALERT_CONFIG);

  // Inputs
  public readonly color: InputSignal<alertColor> = input<alertColor>(this._config.color);
  public readonly label: InputSignal<string | null> = input<string | null>(
    typeof this._config.label === 'string' ? this._config.label : null,
  );
  public readonly hideLabel: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.hideLabel,
    { transform: booleanAttribute },
  );
  /** Overrides the color-derived glyph with another icon from the registry. */
  public readonly icon: InputSignal<systemIcon | undefined> = input<systemIcon>();
  /** Renders an arbitrary SVG or image URL as the icon instead of a registry glyph. */
  public readonly iconSrc: InputSignal<string | undefined> = input<string>();
  public readonly hideIcon: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.hideIcon,
    { transform: booleanAttribute },
  );
  /** Renders a trailing close button. Dismissal is reported through `dismissed`; the consumer owns removal. */
  public readonly closable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  /** Accessible name of the close button. */
  public readonly dismissLabel: InputSignal<string> = input<string>('Dismiss');

  // Outputs
  public readonly dismissed: OutputEmitterRef<void> = output<void>();

  // State
  /** Consumer-provided visual rendered in place of the built-in icon. */
  protected readonly projectedIcon: Signal<AlertIcon | undefined> = contentChild(AlertIcon);

  // Computed
  protected readonly displayLabel: Signal<string> = computed<string>(() => {
    const label = this.label();
    if (label) return label;

    if (typeof this._config.label === 'object') {
      return this._config.label[this.color()];
    }

    return '';
  });

  /**
   * Registry glyph for the current color, or undefined when the icon comes from
   * `iconSrc` — `tls-icon` ignores a source as soon as a name is present.
   */
  protected readonly displayIcon: Signal<systemIcon | undefined> = computed<systemIcon | undefined>(
    () => {
      if (this.iconSrc()) return undefined;

      const icon = this.icon();
      if (icon) return icon;

      const configIcon = this._config.icon;
      if (typeof configIcon === 'string') return configIcon;

      return configIcon[this.color()];
    },
  );

  protected readonly hostClasses: Signal<string[]> = computed<string[]>(() => {
    const className = 'tls-alert';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);

    if (this.closable()) array.push(`${className}--closable`);

    return array;
  });

  protected readonly hostRole: Signal<string> = computed<string>(() => {
    const urgent = ['danger', 'warning'];
    return urgent.includes(this.color()) ? 'alert' : 'note';
  });

  // Protected methods
  protected onClose(): void {
    this.dismissed.emit();
  }
}
