import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '@thalassic/ui';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { HeaderNavigationItem } from './types';

@Component({
  selector: 'app-header',
  imports: [Icon, RouterLink, ThemeToggle],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: { role: 'banner' },
})
export class Header {
  public navItems: HeaderNavigationItem[] = [];
}
