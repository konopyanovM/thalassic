export interface BreadcrumbItem {
  label: string;
  /** Router link for the item. An item without a link renders as plain text. */
  link?: string | unknown[];
  /** Icon source rendered before the label (see tls-icon's iconSrc). */
  icon?: string;
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
