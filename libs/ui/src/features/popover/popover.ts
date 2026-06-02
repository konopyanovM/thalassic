import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Point } from '@thalassic/core';
import { overlayPosition } from '../../types';
import { buildOverlayPositions } from '../../utils';
import { POPOVER_CONFIG } from './popover.token';

@Component({
  selector: 'tls-popover',
  template: `
    <ng-template #content>
      <div
        class="tls-popover"
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
export class Popover implements OnDestroy {
  private static _counter = 0;

  private readonly _overlay = inject(Overlay);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _config = inject(POPOVER_CONFIG);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _templateRef = viewChild.required<TemplateRef<unknown>>('content');
  private _overlayRef: OverlayRef | null = null;
  private readonly _isOpen = signal(false);

  public readonly id = `tls-popover-${++Popover._counter}`;
  public readonly isOpen = this._isOpen.asReadonly();

  public readonly position = input<overlayPosition>(this._config.position);
  public readonly offset = input<Point>(this._config.offset);
  public readonly ariaLabel = input<string | undefined>(undefined);

  private readonly _positions = computed<ConnectedPosition[]>(() =>
    buildOverlayPositions(this.position(), this.offset()),
  );

  // Public methods
  public open(trigger: MouseEvent | HTMLElement): void {
    if (this._overlayRef) return;

    const origin: FlexibleConnectedPositionStrategyOrigin =
      trigger instanceof MouseEvent ? (trigger.currentTarget as HTMLElement) : trigger;

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(this._positions());

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this._overlayRef
      .backdropClick()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.close());
    this._overlayRef.attach(new TemplatePortal(this._templateRef(), this._viewContainerRef));
    this._isOpen.set(true);
  }

  public close(): void {
    if (!this._overlayRef) return;
    this._overlayRef.dispose();
    this._overlayRef = null;
    this._isOpen.set(false);
  }

  public toggle(trigger: MouseEvent | HTMLElement): void {
    if (this._overlayRef) {
      this.close();
    } else {
      this.open(trigger);
    }
  }

  // Lifecycle
  ngOnDestroy(): void {
    if (this._overlayRef) this._overlayRef.dispose();
  }
}
