import { DOCUMENT, effect, inject, Injectable, Renderer2, Signal, signal } from '@angular/core';
import { TLS_THEME_CONFIG } from './tokens';
import { ThemeConfig, themeType } from './types';

@Injectable()
export class ThemeService {
  private readonly _config: ThemeConfig = inject(TLS_THEME_CONFIG);
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _renderer: Renderer2 = inject(Renderer2);

  private LS_THEME = this._config.localStorageKey;

  // Private
  private _currentTheme = signal<themeType>(
    (localStorage.getItem(this.LS_THEME) as themeType) ?? 'light',
  );

  constructor() {
    this._initDefaultTheme();

    effect(() => {
      localStorage.setItem(this.LS_THEME, this._currentTheme());
    });
  }

  // Accessors
  get currentTheme(): Signal<themeType> {
    return this._currentTheme.asReadonly();
  }

  // Public methods
  public toggle(): void {
    if (this._currentTheme() === 'dark') {
      this.setTheme('light');
    } else if (this._currentTheme() === 'light') {
      this.setTheme('dark');
    }
  }

  public setTheme(theme: themeType): void {
    const documentElement = this._document.documentElement;
    const lightThemeClass = this._config.lightThemeClass;
    const darkThemeClass = this._config.darkThemeClass;

    if (theme === 'dark') {
      this._renderer.removeClass(documentElement, lightThemeClass);
      this._renderer.addClass(documentElement, darkThemeClass);
    } else if (theme === 'light') {
      this._renderer.removeClass(documentElement, darkThemeClass);
      this._renderer.addClass(documentElement, lightThemeClass);
    }
    this._currentTheme.set(theme);
  }

  // Private methods
  private _detectSystemTheme(): themeType {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private _initDefaultTheme(): void {
    if (this._config.defaultTheme === 'system') {
      const systemTheme = this._detectSystemTheme();
      this.setTheme(systemTheme);
    } else {
      this.setTheme(this._config.defaultTheme);
    }
  }
}
