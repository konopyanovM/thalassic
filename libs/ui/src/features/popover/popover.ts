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

  private readonly _positions = computed<ConnectedPosition[]>(() =>
    buildOverlayPositions(this.position(), this.offset()),
  );

  // Public methods
  public open(trigger: MouseEvent | HTMLElement): void {
    const origin: FlexibleConnectedPositionStrategyOrigin =
      trigger instanceof MouseEvent ? (trigger.currentTarget as HTMLElement) : trigger;

    this._overlay.open({
      content: this._templateRef(),
      origin,
      positions: this._positions(),
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
