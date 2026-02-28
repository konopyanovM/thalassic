import { DOCUMENT, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { TLS_THEME_CONFIG } from './tokens';
import { ThemeConfig, themeType } from './types';

@Injectable()
export class ThemeService {
  private readonly _config: ThemeConfig = inject(TLS_THEME_CONFIG);
  private readonly _document: Document = inject(DOCUMENT);

  private LS_THEME = this._config.localStorageKey;

  // Private
  private DEFAULT_THEME: themeType = 'light';
  private _currentTheme = signal<themeType>(
    (localStorage.getItem(this.LS_THEME) as themeType) ?? this.DEFAULT_THEME,
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
    if (theme === 'dark') {
      this._document.documentElement.classList.remove(this._config.lightThemeClass);
      this._document.documentElement.classList.add(this._config.darkThemeClass);
    } else if (theme === 'light') {
      this._document.documentElement.classList.remove(this._config.darkThemeClass);
      this._document.documentElement.classList.add(this._config.lightThemeClass);
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
