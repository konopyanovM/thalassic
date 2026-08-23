/** A single action in a FAB menu's fanned-out stack. */
export interface FabMenuItemDefinition {
  label: string;
  /**
   * Icon source rendered leading the label. A consumer with its own icon
   * system supplies a `#itemIcon` template instead, which takes precedence.
   */
  icon?: string;
  disabled?: boolean;
  /** Consumer payload, available to the `#itemIcon` template via the item. */
  data?: unknown;
  action?: () => void;
}
