import { afterNextRender, Component, computed, ElementRef, inject, input, output } from '@angular/core';
import { Button, BUTTON_CONFIG } from '../button';
import { CONFIRM_CONFIG } from './confirm.token';
import { confirmActionsAlign, confirmButton, resolvedConfirmButton } from './confirm.types';

/**
 * Presentational contents of a confirm dialog: an optional title, a message,
 * and cancel / confirm action buttons. Shared by the declarative `tls-confirm`
 * component and the imperative `ConfirmService`; it renders the UI and emits
 * `confirmed` / `cancelled`, but owns no overlay lifecycle.
 */
@Component({
  selector: 'tls-confirm-panel',
  imports: [Button],
  template: `
    @if (title()) {
      <h2 class="tls-confirm__title" [id]="titleId">{{ title() }}</h2>
    }

    <p class="tls-confirm__message" [id]="messageId">{{ message() }}</p>

    <div [class]="actionsClasses()">
      <tls-button
        [label]="resolvedCancel().label"
        [color]="resolvedCancel().color"
        [variant]="resolvedCancel().variant"
        [size]="resolvedCancel().size"
        [icon]="resolvedCancel().icon"
        [rounded]="resolvedCancel().rounded"
        [fluid]="resolvedCancel().fluid"
        [disabled]="resolvedCancel().disabled"
        (click)="cancelled.emit()"
      ></tls-button>

      <tls-button
        [label]="resolvedConfirm().label"
        [color]="resolvedConfirm().color"
        [variant]="resolvedConfirm().variant"
        [size]="resolvedConfirm().size"
        [icon]="resolvedConfirm().icon"
        [rounded]="resolvedConfirm().rounded"
        [fluid]="resolvedConfirm().fluid"
        [disabled]="resolvedConfirm().disabled"
        (click)="confirmed.emit()"
      ></tls-button>
    </div>
  `,
  host: {
    class: 'tls-confirm',
    role: 'alertdialog',
    '[attr.aria-modal]': 'modal() ? "true" : "false"',
    '[id]': 'id',
    '[attr.aria-labelledby]': 'title() ? titleId : null',
    '[attr.aria-describedby]': 'messageId',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    'animate.enter': 'tls-confirm--enter',
    'animate.leave': 'tls-confirm--leave',
  },
})
export class ConfirmPanel {
  private static _counter = 0;

  // Injections
  private readonly _elementRef = inject(ElementRef);
  private readonly _config = inject(CONFIRM_CONFIG);
  private readonly _buttonConfig = inject(BUTTON_CONFIG);

  // Inputs
  public readonly title = input<string | undefined>(undefined);
  public readonly message = input.required<string>();
  public readonly confirm = input<confirmButton | undefined>(undefined);
  public readonly cancel = input<confirmButton | undefined>(undefined);
  public readonly ariaLabel = input<string | undefined>(undefined);

  /** Whether the panel is a focus-trapped modal (`aria-modal="true"`) rather than an anchored popover. */
  public readonly modal = input<boolean>(false);

  public readonly actionsAlign = input<confirmActionsAlign>(this._config.actionsAlign);

  // Outputs
  public readonly confirmed = output<void>();
  public readonly cancelled = output<void>();

  // State
  public readonly id = `tls-confirm-${++ConfirmPanel._counter}`;
  public readonly titleId = `${this.id}-title`;
  public readonly messageId = `${this.id}-message`;

  // Computed
  protected readonly resolvedConfirm = computed<resolvedConfirmButton>(() =>
    this._resolve(this.confirm(), this._config.confirmButton),
  );

  protected readonly resolvedCancel = computed<resolvedConfirmButton>(() =>
    this._resolve(this.cancel(), this._config.cancelButton),
  );

  protected readonly actionsClasses = computed<string[]>(() => [
    'tls-confirm__actions',
    `tls-confirm__actions--${this.actionsAlign()}`,
  ]);

  // Constructor
  constructor() {
    // Move focus to the primary action once the panel has rendered, so the
    // dialog is immediately operable from the keyboard.
    afterNextRender(() => this._focusConfirm());
  }

  // Private methods
  private _resolve(
    button: confirmButton | undefined,
    slotDefault: confirmButton,
  ): resolvedConfirmButton {
    const source: Partial<confirmButton> = button ?? {};

    return {
      label: source.label ?? slotDefault.label,
      color: source.color ?? slotDefault.color ?? this._buttonConfig.color,
      variant: source.variant ?? slotDefault.variant ?? this._buttonConfig.variant,
      size: source.size ?? slotDefault.size ?? this._buttonConfig.size,
      icon: source.icon ?? slotDefault.icon ?? false,
      rounded: source.rounded ?? slotDefault.rounded ?? false,
      fluid: source.fluid ?? slotDefault.fluid ?? false,
      disabled: source.disabled ?? slotDefault.disabled ?? false,
    };
  }

  private _focusConfirm(): void {
    const host = this._elementRef.nativeElement as HTMLElement;
    const buttons = host.querySelectorAll<HTMLButtonElement>('button');
    const confirmButton = buttons.item(buttons.length - 1);
    if (confirmButton) confirmButton.focus();
  }
}
