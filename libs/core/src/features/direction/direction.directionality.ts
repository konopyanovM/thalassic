import { Direction } from '@angular/cdk/bidi';
import { effect, EventEmitter, inject, Injectable, OnDestroy } from '@angular/core';
import { DirectionService } from './direction.service';

/**
 * Adapts {@link DirectionService} to Angular CDK's `Directionality` contract so every
 * CDK overlay (drawer, dialog, menu, popover, select) reacts to the app's direction,
 * including runtime changes. CDK's default `Directionality` reads `<html dir>` once at
 * construction and never updates; provided in place of it (see the direction provider),
 * this bridge stays in sync with the service.
 *
 * Overlays read {@link value} on every layout and re-flip open panels on {@link change}.
 */
@Injectable()
export class DirectionalityBridge implements OnDestroy {
  // Injections
  private readonly _direction = inject(DirectionService);

  // State
  public readonly change = new EventEmitter<Direction>();

  // Accessors
  public get value(): Direction {
    return this._direction.currentDirection();
  }

  constructor() {
    // Emit only on an actual flip; CDK's `Directionality.change` never fires for the
    // initial value.
    let previous = this._direction.currentDirection();

    effect(() => {
      const current = this._direction.currentDirection();
      if (current === previous) return;

      previous = current;
      this.change.emit(current);
    });
  }

  // Lifecycle
  public ngOnDestroy(): void {
    this.change.complete();
  }
}
