import { Component, computed, input, output } from '@angular/core';
import { Button } from '../button';
import { toastAction, toastColor } from './toast.types';

/** Status glyph rendered in the leading icon slot, derived from the toast color. */
type toastIcon = 'success' | 'warning' | 'danger' | 'info';

const ICON_BY_COLOR: Record<toastColor, toastIcon> = {
  primary: 'info',
  secondary: 'info',
  tertiary: 'info',
  success: 'success',
  info: 'info',
  warning: 'warning',
  danger: 'danger',
};

/**
 * Presentational contents of a single toast: an optional leading status icon,
 * a title and message, an optional action button, and an optional close button.
 * Owns no timing or stacking logic — the host element is positioned by
 * `ToastOutlet`, and dismissal is reported through the `dismissed` output.
 */
@Component({
  selector: 'tls-toast',
  imports: [Button],
  templateUrl: './toast.html',
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'role()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    'animate.enter': 'tls-toast--enter',
    'animate.leave': 'tls-toast--leave',
  },
})
export class Toast {
  // Inputs
  public readonly message = input.required<string>();
  public readonly title = input<string | undefined>(undefined);
  public readonly color = input.required<toastColor>();
  public readonly closable = input<boolean>(true);
  public readonly showIcon = input<boolean>(true);
  public readonly action = input<toastAction | undefined>(undefined);
  public readonly ariaLabel = input<string | undefined>(undefined);

  // Outputs
  public readonly dismissed = output<void>();
  public readonly actionTriggered = output<void>();

  // Computed
  protected readonly hostClasses = computed<string[]>(() => [
    'tls-toast',
    `tls-toast--${this.color()}`,
  ]);

  protected readonly icon = computed<toastIcon>(() => ICON_BY_COLOR[this.color()]);

  // Urgent severities announce assertively; the rest announce politely.
  protected readonly role = computed<'alert' | 'status'>(() => {
    const urgent: toastColor[] = ['warning', 'danger'];
    return urgent.includes(this.color()) ? 'alert' : 'status';
  });

  // Protected methods
  protected onAction(): void {
    this.actionTriggered.emit();
  }

  protected onClose(): void {
    this.dismissed.emit();
  }
}
