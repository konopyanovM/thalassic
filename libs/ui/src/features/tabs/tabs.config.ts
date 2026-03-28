import { tabsVariant } from './tabs.types';

export interface TabsConfig {
  variant: tabsVariant;
}

export const DEFAULT_TABS_CONFIG: TabsConfig = {
  variant: 'flat',
};
