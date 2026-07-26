import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, signal } from '@angular/core';
import { ToastOutlet } from './toast-outlet';
import { TOAST_CONFIG } from './toast.token';
import { toastAction, toastColor } from './toast.types';

/** Options accepted by {@link ToastService.show}. */
export interface ToastOptions {
  message: string;
  title?: string;
  color?: toastColor;
  /** Auto-dismiss delay in ms; `0` keeps it open until dismissed. Falls back to the config. */
  duration?: number;
  /** Whether to render a close button. Falls back to the config. */
  closable?: boolean;
  /** Whether to render the leading status icon. Falls back to the config. */
  showIcon?: boolean;
  /** Whether to render the auto-dismiss countdown progress bar. Falls back to the config. */
  showProgress?: boolean;
  /** Optional action button. */
  action?: toastAction;
  /** Accessible name for the toast, when the message alone is not descriptive enough. */
  ariaLabel?: string;
}

/** A live toast, rendered in the stack. */
export interface ToastState {
  readonly id: number;
  readonly message: string;
  readonly title: string | undefined;
  readonly color: toastColor;
  /** Resolved auto-dismiss delay in ms; `0` keeps it open until dismissed. Drives the progress bar. */
  readonly duration: number;
  readonly closable: boolean;
  readonly showIcon: boolean;
  readonly showProgress: boolean;
  readonly action: toastAction | undefined;
  readonly ariaLabel: string | undefined;
}

/** Handle returned by {@link ToastService.show} for dismissing a specific toast. */
export interface ToastRef {
  readonly id: number;
  dismiss(): void;
}

interface ToastTimer {
  remaining: number;
  startedAt: number;
  handle: ReturnType<typeof setTimeout> | null;
}

/**
 * Imperative toast (snackbar) API. Enqueues transient notifications into a single
 * globally-positioned stack rendered by {@link ToastOutlet}. The newest toast sits
 * in front; older ones pile behind it (or list out, per the configured stacking).
 * Auto-dismiss timers are paused while the stack is hovered or focused.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  // Injections
  private readonly _overlay = inject(Overlay);
  private readonly _config = inject(TOAST_CONFIG);

  // State
  private readonly _toasts = signal<ToastState[]>([]);
  private readonly _timers = new Map<number, ToastTimer>();

  private _overlayRef: OverlayRef | null = null;
  private _paused = false;
  private _counter = 0;

  // Accessors
  /** The live toasts, newest first. Consumed by {@link ToastOutlet}. */
  public readonly toasts = this._toasts.asReadonly();

  /** Resolved toast configuration. Consumed by {@link ToastOutlet}. */
  public get config() {
    return this._config;
  }

  // Public methods
  public show(options: ToastOptions): ToastRef {
    this._ensureOutlet();

    const duration = options.duration ?? this._config.duration;

    const toast: ToastState = {
      id: ++this._counter,
      message: options.message,
      title: options.title,
      color: options.color ?? this._config.color,
      duration,
      closable: options.closable ?? this._config.closable,
      showIcon: options.showIcon ?? this._config.showIcon,
      showProgress: options.showProgress ?? this._config.showProgress,
      action: options.action,
      ariaLabel: options.ariaLabel,
    };

    // Newest first; trim the oldest past the cap so the stack stays bounded.
    this._toasts.update(toasts => [toast, ...toasts].slice(0, this._config.max));
    this._pruneOrphanTimers();

    if (duration > 0) this._startTimer(toast.id, duration);

    return { id: toast.id, dismiss: () => this.dismiss(toast.id) };
  }

  public success(message: string, options?: Omit<ToastOptions, 'message' | 'color'>): ToastRef {
    return this.show({ ...options, message, color: this._config.severityColors.success });
  }

  public info(message: string, options?: Omit<ToastOptions, 'message' | 'color'>): ToastRef {
    return this.show({ ...options, message, color: this._config.severityColors.info });
  }

  public warning(message: string, options?: Omit<ToastOptions, 'message' | 'color'>): ToastRef {
    return this.show({ ...options, message, color: this._config.severityColors.warning });
  }

  public danger(message: string, options?: Omit<ToastOptions, 'message' | 'color'>): ToastRef {
    return this.show({ ...options, message, color: this._config.severityColors.danger });
  }

  public dismiss(id: number): void {
    this._clearTimer(id);
    this._toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  public clear(): void {
    for (const id of this._timers.keys()) this._clearTimer(id);
    this._toasts.set([]);
  }

  /** Freezes every auto-dismiss timer, preserving each toast's remaining time. */
  public pause(): void {
    if (this._paused) return;
    this._paused = true;

    const now = Date.now();
    for (const timer of this._timers.values()) {
      if (timer.handle === null) continue;
      clearTimeout(timer.handle);
      timer.handle = null;
      timer.remaining = Math.max(timer.remaining - (now - timer.startedAt), 0);
    }
  }

  /** Resumes every paused auto-dismiss timer from its remaining time. */
  public resume(): void {
    if (!this._paused) return;
    this._paused = false;

    for (const [id, timer] of this._timers) {
      if (timer.handle !== null) continue;
      this._startTimer(id, timer.remaining);
    }
  }

  // Private methods
  private _startTimer(id: number, remaining: number): void {
    if (this._paused) {
      this._timers.set(id, { remaining, startedAt: Date.now(), handle: null });
      return;
    }

    const handle = setTimeout(() => this.dismiss(id), remaining);
    this._timers.set(id, { remaining, startedAt: Date.now(), handle });
  }

  private _clearTimer(id: number): void {
    const timer = this._timers.get(id);
    if (!timer) return;
    if (timer.handle !== null) clearTimeout(timer.handle);
    this._timers.delete(id);
  }

  // Drops timers whose toast was trimmed by the `max` cap without an explicit dismiss.
  private _pruneOrphanTimers(): void {
    const live = new Set(this._toasts().map(toast => toast.id));
    for (const id of this._timers.keys()) {
      if (!live.has(id)) this._clearTimer(id);
    }
  }

  private _ensureOutlet(): void {
    if (this._overlayRef) return;

    this._overlayRef = this._overlay.create({
      positionStrategy: this._overlay.position().global().top('0').left('0'),
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      hasBackdrop: false,
      panelClass: 'tls-toast-overlay',
    });

    this._overlayRef.attach(new ComponentPortal(ToastOutlet));
  }
}
