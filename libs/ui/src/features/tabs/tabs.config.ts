import { tabsOrientation, tabsVariant } from './tabs.types';

export interface TabsConfig {
  variant: tabsVariant;
  orientation: tabsOrientation;
}

export const DEFAULT_TABS_CONFIG: TabsConfig = {
  variant: 'flat',
  orientation: 'horizontal',
};
