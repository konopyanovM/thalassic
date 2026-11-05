import { CdkDialogContainer, DialogRef as CdkDialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { Component, computed, inject, Renderer2, signal } from '@angular/core';
import { afterLeaveAnimation, fadeOutBackdrop } from '../../abstract/overlay';
import { Button } from '../button';
import { Icon } from '../icon';
import { DialogConfig } from './dialog.config';
import { DIALOG_CONFIG } from './dialog.token';

@Component({
  selector: 'tls-dialog',
  templateUrl: './dialog.html',
  imports: [CdkPortalOutlet, Button, Icon],
  host: { '[class]': 'hostClasses()' },
})
export class Dialog extends CdkDialogContainer {
  // Injections
  private readonly _tlsConfig = inject(DIALOG_CONFIG);
  private readonly _dialogRef = inject(CdkDialogRef);
  /** Named apart from the CDK container's own `_renderer`, which is private to it. */
  private readonly _renderer2 = inject(Renderer2);

  // State
  private readonly _state = signal<'enter' | 'leave'>('enter');
  private _closing = false;

  // Computed
  protected readonly hostClasses = computed(() => [
    'tls-dialog',
    `tls-dialog--${this._tlsConfig.size}`,
    `tls-dialog--${this._state()}`,
  ]);

  // Accessors
  protected get config(): DialogConfig {
    return this._tlsConfig;
  }

  // Public methods
  /**
   * Plays the exit animation, then disposes the overlay once it finishes. Routed
   * through here for every dismissal path (close button, backdrop, Escape)
   * because the CDK ref's `close()` disposes synchronously, which would skip the exit.
   */
  public animatedClose(result?: unknown): void {
    if (this._closing) return;
    this._closing = true;

    this._state.set('leave');
    fadeOutBackdrop(this._dialogRef.overlayRef.backdropElement, this._renderer2);
    afterLeaveAnimation(this._elementRef.nativeElement, () =>
      this._dialogRef.close(result),
    );
  }

  // Protected methods
  protected close(): void {
    this.animatedClose();
  }
}
