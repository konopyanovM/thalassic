export type breadcrumbsSize = 'sm' | 'md' | 'lg';

export interface BreadcrumbItem {
  label: string;
  /** Router link for the item. An item without a link renders as plain text. */
  link?: string | unknown[];
  /** Icon source rendered before the label (see tls-icon's iconSrc). */
  icon?: string;
  /**
   * Whether the crumb gives way when a `nowrap` trail runs out of room — for a
   * crumb whose label has no bound on its length, such as a name someone typed.
   * With no crumb marked, the trailing one gives way; once any is marked, only
   * the marked ones do, so a short crumb after a long one keeps its label whole.
   */
  truncate?: boolean;
  /**
   * `view-transition-name` of the separator that follows the crumb, so a
   * transition can carry it along with the crumb it belongs to rather than
   * leaving it to jump to its new place. Unique per trail, like any transition
   * name; the trailing crumb has no separator, so its name goes unused.
   */
  separatorTransitionName?: string;
}

/**
 * Context exposed to a custom item template (see Breadcrumbs.itemTemplate). The
 * item is the implicit value, so `<ng-template let-item>` binds it directly.
 */
export interface BreadcrumbItemContext {
  $implicit: BreadcrumbItem;
  /** Zero-based position of the item in the trail. */
  index: number;
  /** Whether this is the last (current-page) item. */
  last: boolean;
}
