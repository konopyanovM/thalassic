import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { Component, computed, inject, signal } from '@angular/core';
import { afterLeaveAnimation } from '../../abstract/overlay';
import { Icon } from '../icon';
import { DrawerConfig } from './drawer.config';
import { DRAWER_NAMED_SIZES } from './drawer.constants';
import { DRAWER_CONFIG } from './drawer.token';
import { drawerSize } from './drawer.types';

@Component({
  selector: 'tls-drawer',
  templateUrl: './drawer.html',
  imports: [CdkPortalOutlet, Icon],
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
    afterLeaveAnimation(this._elementRef.nativeElement, () =>
      this._dialogRef.close(result),
    );
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
}
