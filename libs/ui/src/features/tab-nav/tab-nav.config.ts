import { tabsItemsAlign, tabsOrientation, tabsVariant } from '../tabs';

export interface TabNavConfig {
  variant: tabsVariant;
  orientation: tabsOrientation;
  itemsAlign: tabsItemsAlign;
  divider: boolean;
}

export const DEFAULT_TAB_NAV_CONFIG: TabNavConfig = {
  variant: 'flat',
  orientation: 'horizontal',
  itemsAlign: 'start',
  divider: false,
};
