import { overlayPosition } from '../../types';

export type menuPosition = overlayPosition;

export type menuItemType = 'item' | 'label' | 'divider' | 'custom';

interface BaseMenuItem {
  type: menuItemType;
}

export interface MenuActionItem extends BaseMenuItem {
  type: 'item';
  label: string;
  icon?: string;
  /** Keyboard shortcut, one entry per key — each renders as its own keycap (e.g. ['⌘', 'C']). */
  shortcut?: string[];
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
