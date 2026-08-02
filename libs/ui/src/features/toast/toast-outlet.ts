import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import {
  TOAST_BASE_Z_INDEX,
  TOAST_COLLAPSED_MIN_SCALE,
  TOAST_COLLAPSED_PEEK,
  TOAST_COLLAPSED_SCALE_STEP,
  TOAST_COLLAPSED_VISIBLE_DEPTH,
  TOAST_EXPANDED_GAP,
} from './toast.constants';
import { ToastService, ToastState } from './toast.service';
import { Toast } from './toast';

interface ToastLayout {
  transform: string;
  /** Depth fade applied to the toast surface; deep toasts in the collapsed pile fade out. */
  depthOpacity: string;
  zIndex: string;
}

/**
 * Single instance rendered into a global CDK overlay by {@link ToastService}. Lays
 * every live toast out as one anchored stack: collapsed into a hover-to-expand
 * pile, or an always-open list, per the resolved config. Each toast's host is the
 * stacking layer, positioned here via transform / scale / z-index computed from
 * the toasts' measured heights; hovering or focusing the region expands the pile
 * and pauses the auto-dismiss timers.
 */
@Component({
  selector: 'tls-toast-outlet',
  imports: [Toast],
  templateUrl: './toast-outlet.html',
  host: { class: 'tls-toast-outlet' },
})
export class ToastOutlet {
  // Injections
  private readonly _service = inject(ToastService);
  private readonly _destroyRef = inject(DestroyRef);

  // State
  protected readonly toasts = this._service.toasts;

  private readonly _pointerInside = signal(false);
  private readonly _focusInside = signal(false);

  // Natural (untransformed) height of each toast host, aligned to `toasts()`
  // (index 0 = front). Drives the expanded list offsets and the region's
  // hover-catching height.
  private readonly _heights = signal<number[]>([]);

  private readonly _toastElements = viewChildren('toastEl', { read: ElementRef });

  private readonly _resizeObserver: ResizeObserver | null =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => this._measure());

  // Computed
  protected readonly position = computed(() => this._service.config.position);

  protected readonly regionLabel = computed(() => this._service.config.regionLabel);

  protected readonly dismissLabel = computed(() => this._service.config.dismissLabel);

  protected readonly expanded = computed<boolean>(
    () => this._service.config.stacking === 'expanded' || this._interacting(),
  );

  // Auto-dismiss is frozen while interacting (when `pauseOnHover` is on); the
  // countdown bars mirror that so they stay in lockstep with the timers.
  protected readonly paused = computed<boolean>(
    () => this._service.config.pauseOnHover && this._interacting(),
  );

  protected readonly regionClasses = computed<string[]>(() => {
    const [blockEdge, inlineEdge] = this.position().split('-');
    const classes = [
      'tls-toast-region',
      `tls-toast-region--${blockEdge}`,
      `tls-toast-region--${inlineEdge}`,
    ];
    if (this.expanded()) classes.push('tls-toast-region--expanded');
    return classes;
  });

  // Height of the hover-catching region: the full expanded list, or the collapsed
  // pile's footprint (front toast plus the visible peeks behind it).
  protected readonly regionHeight = computed<number>(() => {
    const heights = this._heights();
    if (heights.length === 0) return 0;

    if (this.expanded()) {
      const total = heights.reduce((sum, height) => sum + height, 0);
      return total + (heights.length - 1) * TOAST_EXPANDED_GAP;
    }

    const front = heights[0];
    const depth = Math.min(heights.length - 1, TOAST_COLLAPSED_VISIBLE_DEPTH);
    return front + depth * TOAST_COLLAPSED_PEEK;
  });

  protected readonly layouts = computed<ToastLayout[]>(() => {
    const heights = this._heights();
    const expanded = this.expanded();
    const stacksUpward = this.position().startsWith('bottom');
    const sign = stacksUpward ? -1 : 1;

    return this.toasts().map((_, frontIndex) => {
      const zIndex = `${TOAST_BASE_Z_INDEX - frontIndex}`;

      if (expanded) {
        let offset = 0;
        for (let ahead = 0; ahead < frontIndex; ahead++) {
          offset += (heights[ahead] ?? 0) + TOAST_EXPANDED_GAP;
        }
        return { transform: `translateY(${sign * offset}px)`, depthOpacity: '1', zIndex };
      }

      const depth = Math.min(frontIndex, TOAST_COLLAPSED_VISIBLE_DEPTH);
      const translate = sign * depth * TOAST_COLLAPSED_PEEK;
      const scale = Math.max(1 - depth * TOAST_COLLAPSED_SCALE_STEP, TOAST_COLLAPSED_MIN_SCALE);
      const depthOpacity = frontIndex > TOAST_COLLAPSED_VISIBLE_DEPTH ? '0' : '1';

      return { transform: `translateY(${translate}px) scale(${scale})`, depthOpacity, zIndex };
    });
  });

  private readonly _interacting = computed<boolean>(
    () => this._pointerInside() || this._focusInside(),
  );

  // Constructor
  constructor() {
    // Re-observe the rendered toasts whenever the set changes, and take a fresh
    // measurement so the expanded offsets and region height stay accurate.
    effect(() => {
      const elements = this._toastElements();
      const observer = this._resizeObserver;
      if (observer) {
        observer.disconnect();
        for (const element of elements) observer.observe(element.nativeElement);
      }
      this._measure();
    });

    // Pause auto-dismiss while the stack is hovered or focused; resume on leave.
    effect(() => {
      const interacting = this._interacting();
      if (!this._service.config.pauseOnHover) return;
      if (interacting) {
        this._service.pause();
      } else {
        this._service.resume();
      }
    });

    this._destroyRef.onDestroy(() => {
      if (this._resizeObserver) this._resizeObserver.disconnect();
    });
  }

  // Protected methods
  protected onDismiss(id: number): void {
    this._service.dismiss(id);
  }

  protected onAction(toast: ToastState): void {
    if (toast.action) toast.action.handler();
    this._service.dismiss(toast.id);
  }

  protected onPointerEnter(): void {
    this._pointerInside.set(true);
  }

  protected onPointerLeave(): void {
    this._pointerInside.set(false);
  }

  protected onFocusIn(): void {
    this._focusInside.set(true);
  }

  protected onFocusOut(): void {
    this._focusInside.set(false);
  }

  // Private methods
  private _measure(): void {
    this._heights.set(this._toastElements().map(element => element.nativeElement.offsetHeight));
  }
}
