import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { Component, computed, inject, signal } from '@angular/core';
import { DrawerConfig } from './drawer.config';
import { DRAWER_NAMED_SIZES, LEAVE_ANIMATION_FALLBACK_MS } from './drawer.constants';
import { DRAWER_CONFIG } from './drawer.token';
import { drawerSize } from './drawer.types';

@Component({
  selector: 'tls-drawer',
  templateUrl: './drawer.html',
  imports: [CdkPortalOutlet],
  host: {
    '[class]': 'hostClasses()',
    '[style.--tls-drawer-size]': 'customSize',
  },
})
export class Drawer extends CdkDialogContainer {
  // Injections
  private readonly _tlsConfig = inject(DRAWER_CONFIG);
  private readonly _dialogRef = inject(DialogRef);

  // State
  private readonly _state = signal<'enter' | 'leave'>('enter');
  private _closing = false;

  // Computed
  protected readonly hostClasses = computed(() => {
    const classes = [
      'tls-drawer',
      `tls-drawer--${this._tlsConfig.side}`,
      `tls-drawer--${this._sizeClass()}`,
      `tls-drawer--${this._state()}`,
    ];
    if (this._tlsConfig.rounded) classes.push('tls-drawer--rounded');
    return classes;
  });

  // Accessors
  protected get config(): DrawerConfig {
    return this._tlsConfig;
  }

  // The custom CSS length applied inline when `size` is not a named token, else
  // `null` so the attribute is omitted and the size modifier class takes over.
  protected get customSize(): string | null {
    return this._isNamedSize(this._tlsConfig.size) ? null : this._tlsConfig.size;
  }

  // Public methods
  // Plays the slide-out animation, then disposes the overlay once it finishes.
  // Routed through here for every dismissal path (close button, backdrop, Escape)
  // because `DialogRef.close()` disposes synchronously, which would skip the exit.
  public animatedClose(result?: unknown): void {
    if (this._closing) return;
    this._closing = true;

    this._state.set('leave');
    this._afterLeaveAnimation(() => this._dialogRef.close(result));
  }

  // Protected methods
  protected close(): void {
    this.animatedClose();
  }

  // Private methods
  private _sizeClass(): drawerSize | 'custom' {
    const size = this._tlsConfig.size;
    return this._isNamedSize(size) ? size : 'custom';
  }

  private _isNamedSize(size: drawerSize | string): size is drawerSize {
    return DRAWER_NAMED_SIZES.includes(size as drawerSize);
  }

  // Invokes `onDone` when the leave animation ends, disposing immediately when no
  // slide-out actually runs (e.g. the `none` motion level, where the motion mixin
  // emits nothing) so reduced-motion users don't wait out the fallback timeout.
  private _afterLeaveAnimation(onDone: () => void): void {
    const element = this._elementRef.nativeElement;

    let settled = false;
    const finalize = (): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      element.removeEventListener('animationend', onAnimationEnd);
      onDone();
    };

    // Only the host's own slide-out finalizes; ignore `animationend` bubbling up
    // from animated content inside the drawer.
    const onAnimationEnd = (event: AnimationEvent): void => {
      if (event.target === element) finalize();
    };

    element.addEventListener('animationend', onAnimationEnd);

    // Safety net if `animationend` never arrives (e.g. the pane is torn down early).
    const timeoutId = window.setTimeout(finalize, LEAVE_ANIMATION_FALLBACK_MS);

    // The `--leave` class applies on the next change detection; on the following
    // frame, close at once if no animation is running. When motion is enabled the
    // computed `animationName` is never `none`, so this cannot finalize early.
    requestAnimationFrame(() => {
      if (getComputedStyle(element).animationName === 'none') finalize();
    });
  }
}
