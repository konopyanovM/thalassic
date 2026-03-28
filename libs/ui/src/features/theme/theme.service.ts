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
  signal
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { DARK_THEME_CLASS, LIGHT_THEME_CLASS } from './constants';
import { ThemeConfig } from './theme.config';
import { THEME_CONFIG } from './theme.token';
import { themePreference, themeType } from './types';

/**
 * Service responsible for managing the application's theme (light/dark/system).
 */
@Injectable()
export class ThemeService {
  // Injections
  private readonly _config: ThemeConfig = inject(THEME_CONFIG);
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _rendererFactory: RendererFactory2 = inject(RendererFactory2);
  private readonly _platformId = inject(PLATFORM_ID);

  private readonly _renderer: Renderer2 = this._rendererFactory.createRenderer(null, null);
  private readonly _isBrowser: boolean = isPlatformBrowser(this._platformId);

  private readonly LS_THEME = this._config.localStorageKey;

  // Private
  private _currentTheme = signal<themeType>('light');
  private _currentThemePreference = signal<themePreference>('light');

  public onThemeChange: Observable<themeType> = toObservable<themeType>(this._currentTheme);
  public onPreferenceChange: Observable<themePreference> = toObservable<themePreference>(
    this._currentThemePreference,
  );

  constructor() {
    this._initTheme();

    effect(() => {
      if (this._isBrowser) localStorage.setItem(this.LS_THEME, this._currentThemePreference());
    });
  }

  // Accessors
  /**
   * A readonly signal of the currently applied theme (`'light'` or `'dark'`).
   * Reflects the resolved theme even when the preference is `'system'`.
   */
  get currentTheme(): Signal<themeType> {
    return this._currentTheme.asReadonly();
  }

  /**
   * A readonly signal of the user's selected theme preference (`'light'`, `'dark'`, or `'system'`).
   */
  get currentThemePreference(): Signal<themePreference> {
    return this._currentThemePreference.asReadonly();
  }

  // Public methods
  /**
   * Toggles between `'light'` and `'dark'` themes based on the currently applied theme.
   * Does not toggle to `'system'`.
   */
  public toggle(): void {
    this.setTheme(this._currentTheme() === 'light' ? 'dark' : 'light');
  }

  /**
   * Sets the theme preference and applies the corresponding theme to the document.
   * When `'system'` is passed, the theme is resolved from the OS color scheme preference.
   *
   * @param preference - The desired theme preference: `'light'`, `'dark'`, or `'system'`.
   */
  public setTheme(preference: themePreference): void {
    this._currentThemePreference.set(preference);

    if (preference === 'system') {
      this._applyTheme(this._detectSystemTheme());
    } else {
      this._applyTheme(preference);
    }
  }

  // Private methods
  /**
   * Applies the given theme to the document root element by toggling theme CSS classes.
   *
   * @param theme - The theme to apply: `'light'` or `'dark'`.
   */
  private _applyTheme(theme: themeType): void {
    const documentElement = this._document.documentElement;

    if (theme === 'dark') {
      this._renderer.removeClass(documentElement, LIGHT_THEME_CLASS);
      this._renderer.addClass(documentElement, DARK_THEME_CLASS);
      this._currentTheme.set('dark');
    } else {
      this._renderer.removeClass(documentElement, DARK_THEME_CLASS);
      this._renderer.addClass(documentElement, LIGHT_THEME_CLASS);
      this._currentTheme.set('light');
    }
  }

  /**
   * Detects the OS-level color scheme preference using the `prefers-color-scheme` media query.
   *
   * @returns `'dark'` if the OS prefers dark mode, otherwise `'light'`.
   */
  private _detectSystemTheme(): themeType {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Initializes the theme on app startup (browser only).
   * Reads the stored preference from localStorage, falling back to the configured default.
   * Also registers a listener for OS color scheme changes to reactively update the theme
   * when the preference is `'system'`.
   */
  private _initTheme(): void {
    if (!this._isBrowser) return;

    const stored = localStorage.getItem(this.LS_THEME) as themePreference | null;
    this.setTheme(stored ?? this._config.defaultTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (this._currentThemePreference() === 'system') {
        this._applyTheme(event.matches ? 'dark' : 'light');
      }
    });
  }
}
