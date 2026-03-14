import { DOCUMENT, effect, inject, Injectable, Renderer2, Signal, signal } from '@angular/core';
import { ThemeConfig } from './theme.config';
import { THEME_CONFIG } from './theme.token';
import { themeType } from './types';

@Injectable()
export class ThemeService {
  // Injections
  private readonly _config: ThemeConfig = inject(THEME_CONFIG);
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _renderer: Renderer2 = inject(Renderer2);

  private readonly LS_THEME = this._config.localStorageKey;

  // Private
  private _currentTheme = signal<themeType>('light');

  constructor() {
    this._initTheme();

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
    this.setTheme(this._currentTheme() === 'dark' ? 'light' : 'dark');
  }

  public setTheme(theme: themeType): void {
    const documentElement = this._document.documentElement;
    const lightThemeClass = this._config.lightThemeClass;
    const darkThemeClass = this._config.darkThemeClass;

    if (theme === 'dark') {
      this._renderer.removeClass(documentElement, lightThemeClass);
      this._renderer.addClass(documentElement, darkThemeClass);
    } else {
      this._renderer.removeClass(documentElement, darkThemeClass);
      this._renderer.addClass(documentElement, lightThemeClass);
    }
  }

  // Private methods
  private _detectSystemTheme(): themeType {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private _initTheme(): void {
    const localStorageValue = localStorage.getItem(this.LS_THEME) as themeType;
    if (localStorageValue) {
      this.setTheme(localStorageValue);
    } else this._initDefaultTheme();
  }

  private _initDefaultTheme(): void {
    if (this._config.defaultTheme === 'system') {
      this.setTheme(this._detectSystemTheme());
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (!localStorage.getItem(this.LS_THEME)) {
          this.setTheme(event.matches ? 'dark' : 'light');
        }
      });
    } else {
      this.setTheme(this._config.defaultTheme);
    }
  }
}
