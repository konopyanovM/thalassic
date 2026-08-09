import { overlayPosition } from '../../types';

export type menuPosition = overlayPosition;

export type menuItemType = 'item' | 'label' | 'divider' | 'custom';

export type menuItemRole = 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';

interface BaseMenuItem {
  type: menuItemType;
}

export interface MenuActionItem extends BaseMenuItem {
  type: 'item';
  label: string;
  /** Secondary line rendered under the label, exposed to assistive tech via `aria-describedby`. */
  description?: string;
  icon?: string;
  /** Keyboard shortcut, one entry per key — each renders as its own keycap (e.g. ['⌘', 'C']). */
  shortcut?: string[];
  /**
   * ARIA role of the item. Defaults to `menuitem`. A `menuitemradio` / `menuitemcheckbox` item
   * renders a leading check indicator driven by `checked`; the consumer owns the checked state
   * (including radio-group exclusivity) and re-passes it through `items`.
   */
  role?: menuItemRole;
  /** Checked state of a `menuitemradio` / `menuitemcheckbox` item. Ignored for plain items. */
  checked?: boolean;
  /** Whether selecting the item closes the menu. Defaults to `true`. */
  closeOnSelect?: boolean;
  disabled?: boolean;
  data?: unknown;
  action?: () => void;
  link?: string | unknown[];
}

export interface MenuDivider extends BaseMenuItem {
  type: 'divider';
  data?: unknown;
}

export interface MenuLabel extends BaseMenuItem {
  type: 'label';
  label: string;
  data?: unknown;
}

export interface MenuCustomItem {
  type: 'custom';
  key: string;
}

export type MenuItemDefinition = MenuActionItem | MenuDivider | MenuLabel | MenuCustomItem;
