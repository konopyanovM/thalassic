import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, systemIcon } from '../icon';
import { BREADCRUMBS_CONFIG } from './breadcrumbs.token';
import { BreadcrumbItem } from './breadcrumbs.types';

@Component({
  selector: 'tls-breadcrumbs',
  imports: [Icon, NgTemplateOutlet, RouterLink],
  templateUrl: './breadcrumbs.html',
  host: {
    role: 'navigation',
    class: 'tls-breadcrumbs',
    '[attr.aria-label]': 'ariaLabelledby() ? null : ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
  },
})
export class Breadcrumbs {
  // Injections
  private readonly _config = inject(BREADCRUMBS_CONFIG);

  // Inputs
  public readonly items = input<BreadcrumbItem[]>([]);
  public readonly separatorIcon = input<systemIcon>(this._config.separatorIcon);

  /** Accessible name for the breadcrumb navigation landmark. */
  public readonly ariaLabel = input<string>('Breadcrumb');
  public readonly ariaLabelledby = input<string | undefined>(undefined);
}
