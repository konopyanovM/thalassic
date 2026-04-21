import { Component, inject } from '@angular/core';
import { ThemeService } from '@thalassic/core';
import { Button } from '@thalassic/ui';

@Component({
  selector: 'app-theme-toggle',
  imports: [Button],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  private _themeService = inject(ThemeService);

  protected currentTheme = this._themeService.currentTheme;

  protected toggle() {
    this._themeService.toggle();
  }
}
