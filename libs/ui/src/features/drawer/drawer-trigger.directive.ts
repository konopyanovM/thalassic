import { ComponentType } from '@angular/cdk/portal';
import {
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  output,
  signal,
} from '@angular/core';
import {
  DEFAULT_PAN_CONFIG,
  DRAG_DISMISS_POINTER_TYPES,
  PAN_CONFIG,
  PanDirective,
  PanEvent,
} from '@thalassic/core';
import { DrawerRef } from './drawer-ref';
import { DrawerOpenConfig, DrawerService } from './drawer.service';

/**
 * Makes its host the control that opens a drawer, and the place the drawer
 * slides out of and back into. Announces the popup it controls and whether it
 * is open; focus returns to the host when the drawer closes.
 *
 * A press asks for the drawer through `openRequest`. With `dragToOpen`, so does
 * a drag starting on the host — and the drawer then follows the finger out of
 * it, settling open or back closed on release. Opening stays with the caller,
 * so the drawer's content and result keep their types: answer `openRequest` by
 * calling `open` on the directive.
 *
 * ```html
 * <button tlsDrawerTrigger dragToOpen #trigger="tlsDrawerTrigger"
 *         (openRequest)="openSession(trigger)">…</button>
 * ```
 *
 * The drag runs along `dragAxis` (`y` by default, for a sheet at the top or
 * bottom), for touch and pen: a mouse opens the drawer with a click.
 *
 * Place it on a native `<button>`: the press it listens for is the button's own
 * click, which carries the keyboard's Enter and Space with it.
 */
@Directive({
  selector: '[tlsDrawerTrigger]',
  exportAs: 'tlsDrawerTrigger',
  hostDirectives: [{ directive: PanDirective, inputs: ['tlsPan: dragToOpen', 'axis: dragAxis'] }],
  providers: [
    {
      provide: PAN_CONFIG,
      useValue: {
        ...DEFAULT_PAN_CONFIG,
        enabled: false,
        axis: 'y',
        pointerTypes: DRAG_DISMISS_POINTER_TYPES,
      },
    },
  ],
  host: {
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'controlsId()',
    '(click)': 'onClick()',
  },
})
export class DrawerTriggerDirective {
  // Injections
  private readonly _drawerService = inject(DrawerService);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  // Outputs
  /** Asks for the drawer, by a press or a drag; answer it by calling `open`. */
  public readonly openRequest = output<void>();

  // State
  private readonly _openRef = signal<DrawerRef | null>(null);
  // Raised only while `openRequest` is emitted for a drag, so the `open` that
  // answers it knows to open under the drag.
  private _requestedByDrag = false;
  // The drawer following the drag in progress, if one opened for it.
  private _draggedRef: DrawerRef | null = null;

  // Computed
  public readonly isOpen = computed(() => this._openRef() !== null);

  // The drawer it opened, while that is open; nothing to point at otherwise.
  protected readonly controlsId = computed(() => {
    const openRef = this._openRef();
    return openRef === null ? null : openRef.id;
  });

  constructor() {
    // Subscribed rather than bound as host listeners, so the payload keeps its
    // type; `panMove` arrives outside the Angular zone, which is the point of it.
    const pan = inject(PanDirective);
    const subscriptions = [
      pan.panStart.subscribe(() => this._onDragStart()),
      pan.panMove.subscribe(event => this._onDragMove(event)),
      pan.panEnd.subscribe(event => this._onDragEnd(event)),
      pan.panCancel.subscribe(() => this._onDragEnd(null)),
    ];
    inject(DestroyRef).onDestroy(() => {
      for (const subscription of subscriptions) subscription.unsubscribe();
      // The drag ends with the host, which takes the gesture's own end with it;
      // the drawer following it would otherwise be left where the finger was.
      this._onDragEnd(null);
    });
  }

  // Public methods
  /**
   * Opens a drawer from the host, which the drawer takes as its origin — under
   * the drag in progress when answering one.
   */
  public open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config?: Omit<DrawerOpenConfig<D>, 'origin' | 'restoreFocus' | 'openByDrag'>,
  ): DrawerRef<R, C> {
    const host = this._elementRef.nativeElement;
    const drawerRef = this._drawerService.open<R, D, C>(component, {
      ...config,
      origin: host,
      restoreFocus: host,
      openByDrag: this._requestedByDrag,
    });

    const trackedRef = drawerRef as DrawerRef;
    this._openRef.set(trackedRef);
    if (this._requestedByDrag) this._draggedRef = trackedRef;
    drawerRef.closed.subscribe(() => {
      if (this._openRef() === trackedRef) this._openRef.set(null);
    });

    return drawerRef;
  }

  // Protected methods
  protected onClick(): void {
    // A drawer already open for this trigger — the press that ended a drag
    // included — is not asked for again.
    if (this.isOpen()) return;
    this.openRequest.emit();
  }

  // Private methods
  private _onDragStart(): void {
    if (this.isOpen()) return;

    this._requestedByDrag = true;
    this.openRequest.emit();
    this._requestedByDrag = false;
  }

  private _onDragMove(event: PanEvent): void {
    if (this._draggedRef !== null) this._draggedRef.followOpenDrag(event);
  }

  private _onDragEnd(event: PanEvent | null): void {
    const drawerRef = this._draggedRef;
    this._draggedRef = null;
    if (drawerRef !== null) drawerRef.releaseOpenDrag(event);
  }
}
