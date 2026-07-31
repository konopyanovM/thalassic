import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { breakpoint } from './types';
import { ViewportConfig } from './viewport.config';
import { VIEWPORT_CONFIG } from './viewport.token';

/**
 * Service that exposes the current viewport as reactive signals, so templates and
 * component logic can make *structural* decisions from width (render a drawer vs a
 * sidebar, swap a menu for a bottom sheet, change how many items to fetch).
 *
 * It is the read-side companion to the SCSS `breakpoint` mixin: both key off the
 * same `max-width` thresholds (see {@link ViewportConfig}), so `isBelow('md')`
 * flips at exactly the width where `@include breakpoint(md)` takes effect. Purely
 * visual reflow stays in CSS — reach for this service only when TypeScript needs to
 * branch on width.
 *
 * State is driven entirely by `matchMedia`, so it only recomputes when the viewport
 * actually crosses a breakpoint. On the server every query resolves to its
 * desktop-first default (no match, active breakpoint `'base'`).
 */
@Injectable()
export class ViewportService {
  // Injections
  private readonly _config: ViewportConfig = inject(VIEWPORT_CONFIG);
  private readonly _platformId = inject(PLATFORM_ID);

  private readonly _isBrowser: boolean = isPlatformBrowser(this._platformId);

  // State
  /**
   * Named breakpoints ordered by ascending `max-width`, so the first match found
   * while scanning is always the tightest (smallest) matching range.
   */
  private readonly _orderedBreakpoints: breakpoint[] = (
    Object.keys(this._config.breakpoints) as breakpoint[]
  ).sort((first, second) => this._config.breakpoints[first] - this._config.breakpoints[second]);

  /** `viewport width <= breakpoint` state, one writable signal per breakpoint. */
  private readonly _matches: Record<breakpoint, WritableSignal<boolean>> = Object.fromEntries(
    this._orderedBreakpoints.map(name => [name, signal(false)]),
  ) as Record<breakpoint, WritableSignal<boolean>>;

  /** Readonly views of {@link _matches}, exposed as-is by {@link isBelow}. */
  private readonly _matchesReadonly: Record<breakpoint, Signal<boolean>> = Object.fromEntries(
    this._orderedBreakpoints.map(name => [name, this._matches[name].asReadonly()]),
  ) as Record<breakpoint, Signal<boolean>>;

  // Computed
  private _activeBreakpoint = computed<breakpoint | 'base'>(() => {
    for (const name of this._orderedBreakpoints) {
      if (this._matches[name]()) return name;
    }

    return 'base';
  });

  constructor() {
    this._initViewport();
  }

  // Accessors
  /**
   * A readonly signal of the tightest breakpoint the viewport currently sits within,
   * or `'base'` when it is wider than every breakpoint. Ranges are half-open on the
   * upper bound: e.g. `'md'` covers `sm < width <= md`.
   */
  get activeBreakpoint(): Signal<breakpoint | 'base'> {
    return this._activeBreakpoint;
  }

  // Public methods
  /**
   * Returns a readonly signal that is `true` while the viewport width is at or below
   * the given breakpoint — the exact condition under which the SCSS
   * `@include breakpoint(name)` block applies.
   *
   * @param name - The breakpoint to test against (`'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`).
   */
  public isBelow(name: breakpoint): Signal<boolean> {
    return this._matchesReadonly[name];
  }

  // Private methods
  /**
   * Initializes the breakpoint signals on app startup (browser only).
   * Wires a `matchMedia` listener per breakpoint, seeding each with its current match.
   */
  private _initViewport(): void {
    if (!this._isBrowser) return;

    for (const name of this._orderedBreakpoints) {
      const query = window.matchMedia(`(max-width: ${this._config.breakpoints[name]}px)`);
      this._matches[name].set(query.matches);
      query.addEventListener('change', event => this._matches[name].set(event.matches));
    }
  }
}
