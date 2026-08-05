import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
} from '@angular/cdk/overlay';
import { Component, computed, inject, input, output, TemplateRef, viewChild } from '@angular/core';
import { Point } from '@thalassic/core';
import { createOverlayManager } from '../../abstract/overlay';
import { overlayPosition } from '../../types';
import { buildOverlayPositions } from '../../utils';
import { ConfirmPanel } from './confirm-panel';
import { CONFIRM_CONFIG } from './confirm.token';
import { confirmActionsAlign, confirmButton, confirmSize } from './confirm.types';

/**
 * Declarative confirm dialog anchored to a trigger. Sits in the template
 * alongside its trigger and is driven imperatively via {@link open} /
 * {@link toggle}; resolves through the `confirmed` / `cancelled` outputs.
 * Dismissing via backdrop or Escape counts as `cancelled`. For promise-based
 * flows in TypeScript, use `ConfirmService` instead.
 */
@Component({
  selector: 'tls-confirm',
  imports: [ConfirmPanel],
  template: `
    <ng-template #content>
      <tls-confirm-panel
        [title]="title()"
        [message]="message()"
        [confirm]="confirm()"
        [cancel]="cancel()"
        [actionsAlign]="actionsAlign()"
        [size]="size()"
        [ariaLabel]="ariaLabel()"
        (confirmed)="onConfirm()"
        (cancelled)="onCancel()"
      ></tls-confirm-panel>
    </ng-template>
  `,
})
export class Confirm {
  // Injections
  private readonly _config = inject(CONFIRM_CONFIG);
  private readonly _overlay = createOverlayManager();

  private readonly _templateRef = viewChild.required<TemplateRef<unknown>>('content');

  // Inputs
  public readonly title = input<string | undefined>(undefined);
  public readonly message = input.required<string>();
  public readonly confirm = input<confirmButton | undefined>(undefined);
  public readonly cancel = input<confirmButton | undefined>(undefined);
  public readonly actionsAlign = input<confirmActionsAlign>(this._config.actionsAlign);
  public readonly size = input<confirmSize>(this._config.size);
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly position = input<overlayPosition>(this._config.position);
  public readonly offset = input<Point>(this._config.offset);

  // Outputs
  public readonly confirmed = output<void>();
  public readonly cancelled = output<void>();

  // State
  public readonly isOpen = this._overlay.isOpen;

  // Tracks whether the current session ended through an explicit action, so a
  // backdrop / Escape dismissal is reported as a cancellation exactly once.
  private _resolved = false;

  // Element focused before opening, restored on close so keyboard focus returns
  // to the trigger rather than being lost when the panel is removed.
  private _previouslyFocused: HTMLElement | null = null;

  // Computed
  private readonly _positions = computed<ConnectedPosition[]>(() =>
    buildOverlayPositions(this.position(), this.offset()),
  );

  // Public methods
  public open(trigger: MouseEvent | HTMLElement): void {
    const origin: FlexibleConnectedPositionStrategyOrigin =
      trigger instanceof MouseEvent ? (trigger.currentTarget as HTMLElement) : trigger;

    this._resolved = false;
    this._previouslyFocused = document.activeElement as HTMLElement | null;
    this._overlay.open({
      content: this._templateRef(),
      origin,
      positions: this._positions(),
      onClose: () => this._onClose(),
    });
  }

  public close(): void {
    this._overlay.close();
  }

  public toggle(trigger: MouseEvent | HTMLElement): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open(trigger);
    }
  }

  // Protected methods
  protected onConfirm(): void {
    this._resolved = true;
    this.confirmed.emit();
    this.close();
  }

  protected onCancel(): void {
    this._resolved = true;
    this.cancelled.emit();
    this.close();
  }

  // Private methods
  private _onClose(): void {
    if (this._previouslyFocused) this._previouslyFocused.focus();
    if (this._resolved) return;
    this.cancelled.emit();
  }
}
