import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  TemplateRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, systemIcon } from '../icon';
import { BREADCRUMBS_CONFIG } from './breadcrumbs.token';
import { BreadcrumbItem, BreadcrumbItemContext, breadcrumbsSize } from './breadcrumbs.types';

@Component({
  selector: 'tls-breadcrumbs',
  imports: [Icon, NgTemplateOutlet, RouterLink],
  templateUrl: './breadcrumbs.html',
  host: {
    role: 'navigation',
    '[class]': 'classes()',
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

  /** Overall scale of the trail: type size, link height, and glyph sizes together. */
  public readonly size: InputSignal<breadcrumbsSize> = input<breadcrumbsSize>(this._config.size);

  /**
   * Keeps the trail on a single line: instead of wrapping, crumbs shrink and
   * truncate their labels with an ellipsis. For trails in width-constrained
   * chrome (a header bar) where a second line would break the surrounding
   * layout.
   */
  public readonly nowrap: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /** Accessible name for the breadcrumb navigation landmark. */
  public readonly ariaLabel = input<string>('Breadcrumb');
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  // Content
  // Optional projected template for an item's inner content (label/icon),
  // rendered in place of the built-in label. The list structure, links,
  // separators, and `aria-current` stay owned by the component. Bind the item
  // with `<ng-template let-item>`; see BreadcrumbItemContext for the full context.
  public readonly itemTemplate = contentChild<TemplateRef<BreadcrumbItemContext>>(TemplateRef);

  protected readonly classes = computed(() => {
    const className = 'tls-breadcrumbs';
    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);

    if (this.nowrap()) array.push(`${className}--nowrap`);

    return array;
  });
}
