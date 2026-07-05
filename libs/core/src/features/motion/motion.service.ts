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
import { MOTION_ATTRIBUTE } from './constants';
import { MotionConfig } from './motion.config';
import { MOTION_CONFIG } from './motion.token';
import { motionLevel, motionPreference } from './types';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Service responsible for managing the application's motion level
 * (`none` / `essential` / `full` / `system`).
 *
 * The resolved {@link motionLevel} is reflected onto the document root as the
 * `data-motion` attribute, which theme stylesheets gate their animations on.
 * `essential` covers small, functional motion (a panel telling you where it
 * came from); `full` adds expressive/decorative motion on top.
 */
@Injectable()
export class MotionService {
  // Injections
  private readonly _config: MotionConfig = inject(MOTION_CONFIG);
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _rendererFactory: RendererFactory2 = inject(RendererFactory2);
  private readonly _platformId = inject(PLATFORM_ID);

  private readonly _renderer: Renderer2 = this._rendererFactory.createRenderer(null, null);
  private readonly _isBrowser: boolean = isPlatformBrowser(this._platformId);

  private readonly LS_MOTION = this._config.localStorageKey;

  // Private
  private _currentLevel = signal<motionLevel>('full');
  private _currentPreference = signal<motionPreference>('full');

  constructor() {
    this._initMotion();

    effect(() => {
      if (this._isBrowser) localStorage.setItem(this.LS_MOTION, this._currentPreference());
    });
  }

  // Accessors
  /**
   * A readonly signal of the currently applied motion level
   * (`'none'`, `'essential'`, or `'full'`). Reflects the resolved level even
   * when the preference is `'system'`.
   */
  get currentMotionLevel(): Signal<motionLevel> {
    return this._currentLevel.asReadonly();
  }

  /**
   * A readonly signal of the user's selected motion preference
   * (`'none'`, `'essential'`, `'full'`, or `'system'`).
   */
  get currentMotionPreference(): Signal<motionPreference> {
    return this._currentPreference.asReadonly();
  }

  // Public methods
  /**
   * Sets the motion preference and applies the corresponding level to the document.
   * When `'system'` is passed, the level is resolved from the OS reduced-motion setting.
   *
   * @param preference - The desired preference: `'none'`, `'essential'`, `'full'`, or `'system'`.
   */
  public setMotion(preference: motionPreference): void {
    this._currentPreference.set(preference);

    if (preference === 'system') {
      this._applyMotion(this._detectSystemMotion());
    } else {
      this._applyMotion(preference);
    }
  }

  // Private methods
  /**
   * Applies the given level to the document root element by setting the `data-motion` attribute.
   *
   * @param level - The level to apply: `'none'`, `'essential'`, or `'full'`.
   */
  private _applyMotion(level: motionLevel): void {
    this._renderer.setAttribute(this._document.documentElement, MOTION_ATTRIBUTE, level);
    this._currentLevel.set(level);
  }

  /**
   * Resolves the level to apply while the preference is `'system'`, from the OS
   * reduced-motion setting. Reduced motion keeps `essential` (small, functional)
   * motion; otherwise the full experience is used.
   *
   * @returns `'essential'` if the OS prefers reduced motion, otherwise `'full'`.
   */
  private _detectSystemMotion(): motionLevel {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'essential' : 'full';
  }

  /**
   * Initializes the motion level on app startup (browser only).
   * Reads the stored preference from localStorage, falling back to the configured default.
   * Also registers a listener for OS reduced-motion changes to reactively update the level
   * when the preference is `'system'`.
   */
  private _initMotion(): void {
    if (!this._isBrowser) return;

    const stored = localStorage.getItem(this.LS_MOTION) as motionPreference | null;
    this.setMotion(stored ?? this._config.defaultMotion);

    window.matchMedia(REDUCED_MOTION_QUERY).addEventListener('change', event => {
      if (this._currentPreference() === 'system') {
        this._applyMotion(event.matches ? 'essential' : 'full');
      }
    });
  }
}
