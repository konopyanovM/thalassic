export interface BreadcrumbItem {
  label: string;
  /** Router link for the item. An item without a link renders as plain text. */
  link?: string | unknown[];
  /** Icon source rendered before the label (see tls-icon's iconSrc). */
  icon?: string;
}
