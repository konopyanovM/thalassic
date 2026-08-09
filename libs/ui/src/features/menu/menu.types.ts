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
  /**
   * Key of a `<tls-menu-item>` slot whose content replaces this item's default content
   * (check indicator, icon, label, shortcut). The menu still renders the interactive
   * wrapper with its ARIA and keyboard wiring. Takes precedence over `#itemTemplate`.
   */
  templateKey?: string;
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

/** A non-label item paired with its index in the source `items` array (the index keys per-item element ids). */
export interface MenuRenderEntry {
  item: Exclude<MenuItemDefinition, MenuLabel>;
  index: number;
}

/**
 * A `label` item together with the run of items it introduces — everything up to
 * the next label or divider. Rendered as a `role="group"` container named after
 * the label, so assistive tech announces the section an item belongs to.
 */
export interface MenuRenderGroup {
  kind: 'group';
  label: MenuLabel;
  entries: MenuRenderEntry[];
}

/** An item outside any labeled section, rendered directly in the menu. */
export interface MenuRenderSingle {
  kind: 'single';
  entry: MenuRenderEntry;
}

export type MenuRenderBlock = MenuRenderGroup | MenuRenderSingle;
