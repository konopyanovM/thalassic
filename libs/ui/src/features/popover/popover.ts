import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
} from '@angular/cdk/overlay';
import { Component, computed, inject, input, TemplateRef, viewChild } from '@angular/core';
import { Point } from '@thalassic/core';
import { createOverlayManager } from '../../abstract/overlay';
import { overlayPosition } from '../../types';
import { buildOverlayPositions } from '../../utils';
import { POPOVER_CONFIG } from './popover.token';

@Component({
  selector: 'tls-popover',
  host: {
    // Nothing renders in place — the panel lives in an overlay — so the host
    // leaves the flow rather than claiming a slot (and a flex/grid gap) as an
    // invisible empty box.
    style: 'display: none',
  },
  template: `
    <ng-template #content>
      <div
        class="tls-popover"
        animate.enter="tls-popover--enter"
        animate.leave="tls-popover--leave"
        [id]="id"
        role="dialog"
        aria-modal="false"
        [attr.aria-label]="ariaLabel() ?? null"
      >
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
})
export class Popover {
  private static _counter = 0;

  private readonly _config = inject(POPOVER_CONFIG);
  private readonly _overlay = createOverlayManager();

  private readonly _templateRef = viewChild.required<TemplateRef<unknown>>('content');

  public readonly id = `tls-popover-${++Popover._counter}`;
  public readonly isOpen = this._overlay.isOpen;

  public readonly position = input<overlayPosition>(this._config.position);
  public readonly offset = input<Point>(this._config.offset);
  public readonly ariaLabel = input<string | undefined>(undefined);
  /**
   * Extra class(es) placed on the overlay pane, so one popover can carry its own
   * treatment where the shared one does not fit.
   *
   * The pane sits outside every component's template and carries no style
   * encapsulation attribute, so a consumer's scoped rules cannot otherwise reach
   * it. A class named here is the handle they get. The panel declares its own
   * `--tls-popover-*` properties, which beat anything inherited from the pane, so
   * a rule that retunes one has to name the panel too: `.<class> .tls-popover`.
   */
  public readonly panelClass = input<string | string[] | undefined>(undefined);

  private readonly _positions = computed<ConnectedPosition[]>(() =>
    buildOverlayPositions(this.position(), this.offset()),
  );

  // Public methods
  public open(trigger: MouseEvent | HTMLElement): void {
    const origin: FlexibleConnectedPositionStrategyOrigin =
      trigger instanceof MouseEvent ? (trigger.currentTarget as HTMLElement) : trigger;

    const panelClass = this.panelClass();

    this._overlay.open({
      content: this._templateRef(),
      origin,
      positions: this._positions(),
      // Omitted rather than passed as undefined: the manager spreads the key in
      // only when it is set, and CDK treats an explicit undefined as a class.
      ...(panelClass != null && { panelClass }),
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
}
