import { tabsOrientation, tabsVariant } from '../tabs';

export interface TabNavConfig {
  variant: tabsVariant;
  orientation: tabsOrientation;
  divider: boolean;
}

export const DEFAULT_TAB_NAV_CONFIG: TabNavConfig = {
  variant: 'flat',
  orientation: 'horizontal',
  divider: false,
};
