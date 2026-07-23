import { tabsHeaderPosition, tabsOrientation, tabsVariant } from './tabs.types';

export interface TabsConfig {
  variant: tabsVariant;
  orientation: tabsOrientation;
  headerPosition: tabsHeaderPosition;
}

export const DEFAULT_TABS_CONFIG: TabsConfig = {
  variant: 'flat',
  orientation: 'horizontal',
  headerPosition: 'start',
};
