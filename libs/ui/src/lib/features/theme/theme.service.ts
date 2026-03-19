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
import { DARK_THEME_CLASS, LIGHT_THEME_CLASS } from './constants';
import { ThemeConfig } from './theme.config';
import { THEME_CONFIG } from './theme.token';
import { themePreference, themeType } from './types';

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

  constructor() {
    this._initTheme();

    effect(() => {
      if (this._isBrowser) localStorage.setItem(this.LS_THEME, this._currentThemePreference());
    });
  }

  // Accessors
  get currentTheme(): Signal<themeType> {
    return this._currentTheme.asReadonly();
  }

  get currentThemePreference(): Signal<themePreference> {
    return this._currentThemePreference.asReadonly();
  }

  // Public methods
  public toggle(): void {
    this.setTheme(this._currentTheme() === 'light' ? 'dark' : 'light');
  }

  public setTheme(preference: themePreference): void {
    this._currentThemePreference.set(preference);

    if (preference === 'system') {
      this._applyTheme(this._detectSystemTheme());
    } else {
      this._applyTheme(preference);
    }
  }

  // Private methods
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

  private _detectSystemTheme(): themeType {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

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
