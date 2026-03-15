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
import { themeType } from './types';

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

  constructor() {
    this._initTheme();

    effect(() => {
      if (this._isBrowser) localStorage.setItem(this.LS_THEME, this._currentTheme());
    });
  }

  // Accessors
  get currentTheme(): Signal<themeType> {
    return this._currentTheme.asReadonly();
  }

  // Public methods
  public toggle(): void {
    this.setTheme(this._currentTheme() === 'light' ? 'dark' : 'light');
  }

  public setTheme(theme: themeType): void {
    const documentElement = this._document.documentElement;
    const lightThemeClass = LIGHT_THEME_CLASS;
    const darkThemeClass = DARK_THEME_CLASS;

    if (theme === 'dark') {
      this._renderer.removeClass(documentElement, lightThemeClass);
      this._renderer.addClass(documentElement, darkThemeClass);
      this._currentTheme.set('dark');
    } else {
      this._renderer.removeClass(documentElement, darkThemeClass);
      this._renderer.addClass(documentElement, lightThemeClass);
      this._currentTheme.set('light');
    }
  }

  // Private methods
  private _detectSystemTheme(): themeType {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private _initTheme(): void {
    if (!this._isBrowser) return;
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
