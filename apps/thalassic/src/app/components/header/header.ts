import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Icon } from '@thalassic/ui';
import { HeaderNavigationItem } from './types';

@Component({
  selector: 'app-header',
  imports: [Icon, RouterLink, Button],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public navItems: HeaderNavigationItem[] = [
    {
      label: 'Components',
      link: 'components',
    },
  ];
}
