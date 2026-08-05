import { ConfigurableFocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';
import {
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, inject, Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Point } from '@thalassic/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { overlayPosition } from '../../types';
import { buildOverlayPositions } from '../../utils';
import { ConfirmPanel } from './confirm-panel';
import { disposeAfterLeaveAnimation } from '../../abstract/overlay';
import { MODAL_BACKDROP_CLASS } from './confirm.constants';
import { CONFIRM_CONFIG } from './confirm.token';
import { confirmActionsAlign, confirmButton, confirmSize } from './confirm.types';

export interface ConfirmOptions {
  /**
   * Element (or the originating event) the dialog is anchored to. Present opens
   * an anchored popover next to the trigger; omitting it opens a centered,
   * focus-trapped modal instead.
   */
  trigger?: HTMLElement | MouseEvent;
  message: string;
  title?: string;
  confirm?: confirmButton;
  cancel?: confirmButton;
  actionsAlign?: confirmActionsAlign;
  size?: confirmSize;
  position?: overlayPosition;
  offset?: Point;
  ariaLabel?: string;
}

/**
 * Imperative confirm dialog for `await`-style flows: opens a dialog and resolves
 * `true` on confirm, `false` on cancel / backdrop / Escape. Anchors to the
 * `trigger` when given, otherwise opens as a centered modal. For a template-driven
 * anchored equivalent, use the `tls-confirm` component.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  // Injections
  private readonly _overlay = inject(Overlay);
  private readonly _focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  private readonly _router = inject(Router, { optional: true });
  private readonly _config = inject(CONFIRM_CONFIG);

  // Public methods
  public confirm(options: ConfirmOptions): Promise<boolean> {
    const trigger = options.trigger;
    const modal = !trigger;

    const overlayRef = modal
      ? this._createModalOverlay()
      : this._createAnchoredOverlay(trigger, options);

    const panelRef = overlayRef.attach(new ComponentPortal(ConfirmPanel));
    this._applyOptions(panelRef, options, modal);

    return this._wire(overlayRef, panelRef, modal);
  }

  // Private methods
  private _createAnchoredOverlay(
    trigger: HTMLElement | MouseEvent,
    options: ConfirmOptions,
  ): OverlayRef {
    const origin: FlexibleConnectedPositionStrategyOrigin =
      trigger instanceof MouseEvent ? (trigger.currentTarget as HTMLElement) : trigger;

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(
        buildOverlayPositions(
          options.position ?? this._config.position,
          options.offset ?? this._config.offset,
        ),
      );

    return this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
  }

  private _createModalOverlay(): OverlayRef {
    const positionStrategy = this._overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    return this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: MODAL_BACKDROP_CLASS,
    });
  }

  private _applyOptions(
    panelRef: ComponentRef<ConfirmPanel>,
    options: ConfirmOptions,
    modal: boolean,
  ): void {
    panelRef.setInput('message', options.message);
    panelRef.setInput('title', options.title);
    panelRef.setInput('confirm', options.confirm);
    panelRef.setInput('cancel', options.cancel);
    panelRef.setInput('actionsAlign', options.actionsAlign ?? this._config.actionsAlign);
    panelRef.setInput('size', options.size ?? this._config.size);
    panelRef.setInput('ariaLabel', options.ariaLabel);
    panelRef.setInput('modal', modal);
  }

  private _wire(
    overlayRef: OverlayRef,
    panelRef: ComponentRef<ConfirmPanel>,
    modal: boolean,
  ): Promise<boolean> {
    // Capture the pre-open focus so it can be restored on dismissal. The panel
    // moves initial focus to the primary action; a modal additionally traps
    // focus for its lifetime, so the trap only constrains tabbing.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTrap: FocusTrap | null = modal
      ? this._focusTrapFactory.create(overlayRef.overlayElement)
      : null;

    return new Promise<boolean>(resolve => {
      const subscriptions = new Subscription();

      const settle = (result: boolean): void => {
        subscriptions.unsubscribe();
        if (focusTrap) focusTrap.destroy();
        this._dismiss(overlayRef);
        if (previouslyFocused) previouslyFocused.focus();
        resolve(result);
      };

      subscriptions.add(panelRef.instance.confirmed.subscribe(() => settle(true)));
      subscriptions.add(panelRef.instance.cancelled.subscribe(() => settle(false)));
      subscriptions.add(overlayRef.backdropClick().subscribe(() => settle(false)));
      subscriptions.add(
        overlayRef
          .keydownEvents()
          .pipe(filter(event => event.key === 'Escape'))
          .subscribe(() => settle(false)),
      );

      // The overlay is not tied to a component, so a route change would leave it
      // orphaned over the next page; dismiss it (as a cancellation) on navigation.
      if (this._router) {
        subscriptions.add(
          this._router.events
            .pipe(filter(event => event instanceof NavigationStart))
            .subscribe(() => settle(false)),
        );
      }
    });
  }

  // Detaches the overlay so Angular's `animate.leave` plays the exit animation,
  // then disposes the pane once that animation finishes.
  private _dismiss(overlayRef: OverlayRef): void {
    overlayRef.detach();
    disposeAfterLeaveAnimation(overlayRef);
  }
}
