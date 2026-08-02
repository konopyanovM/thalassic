import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
  Signal,
  signal,
} from '@angular/core';
import { DIRECTION_ATTRIBUTE, DIRECTIONS } from './constants';
import { DirectionConfig } from './direction.config';
import { DIRECTION_CONFIG } from './direction.token';
import { direction } from './types';

/**
 * Service responsible for managing the application's layout direction
 * (`ltr` / `rtl`).
 *
 * The direction is reflected onto the document root as the `dir` attribute, which
 * stylesheets react to (e.g. `:root[dir='rtl']`). It is also bridged into Angular
 * CDK's `Directionality` (see the direction provider) so every CDK overlay flips
 * with it.
 */
@Injectable()
export class DirectionService {
  // Injections
  private readonly _config: DirectionConfig = inject(DIRECTION_CONFIG);
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _rendererFactory: RendererFactory2 = inject(RendererFactory2);
  private readonly _platformId = inject(PLATFORM_ID);

  private readonly _renderer: Renderer2 = this._rendererFactory.createRenderer(null, null);
  private readonly _isBrowser: boolean = isPlatformBrowser(this._platformId);

  private readonly LS_DIRECTION = this._config.localStorageKey;

  // Private
  private _currentDirection = signal<direction>('ltr');

  constructor() {
    this._initDirection();

    effect(() => {
      if (this._isBrowser) localStorage.setItem(this.LS_DIRECTION, this._currentDirection());
    });
  }

  // Accessors
  /**
   * A readonly signal of the currently applied direction (`'ltr'` or `'rtl'`).
   */
  get currentDirection(): Signal<direction> {
    return this._currentDirection.asReadonly();
  }

  // Public methods
  /**
   * Sets the layout direction and reflects it onto the document root.
   *
   * @param value - The desired direction: `'ltr'` or `'rtl'`.
   */
  public setDirection(value: direction): void {
    this._applyDirection(value);
  }

  /**
   * Toggles between `'ltr'` and `'rtl'` based on the currently applied direction.
   */
  public toggle(): void {
    this.setDirection(this._currentDirection() === 'ltr' ? 'rtl' : 'ltr');
  }

  // Private methods
  /**
   * Applies the given direction to the document root element by setting the `dir` attribute.
   *
   * @param value - The direction to apply: `'ltr'` or `'rtl'`.
   */
  private _applyDirection(value: direction): void {
    this._renderer.setAttribute(this._document.documentElement, DIRECTION_ATTRIBUTE, value);
    this._currentDirection.set(value);
  }

  /**
   * Initializes the direction on app startup (browser only).
   * Reads the stored value from localStorage, falling back to the configured default.
   */
  private _initDirection(): void {
    if (!this._isBrowser) return;

    // The stored value is untrusted; anything but a valid direction falls back
    // to the default rather than landing on the document as-is.
    const stored = localStorage.getItem(this.LS_DIRECTION) as direction | null;
    const valid = stored !== null && DIRECTIONS.includes(stored);
    this.setDirection(valid ? stored : this._config.defaultDirection);
  }
}
