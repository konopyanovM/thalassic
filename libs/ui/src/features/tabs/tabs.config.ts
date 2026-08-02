import {
  tabsHeaderAlign,
  tabsHeaderPosition,
  tabsItemsAlign,
  tabsOrientation,
  tabsVariant,
} from './tabs.types';

export interface TabsConfig {
  variant: tabsVariant;
  orientation: tabsOrientation;
  headerPosition: tabsHeaderPosition;
  headerAlign: tabsHeaderAlign;
  itemsAlign: tabsItemsAlign;
}

export const DEFAULT_TABS_CONFIG: TabsConfig = {
  variant: 'flat',
  orientation: 'horizontal',
  headerPosition: 'start',
  headerAlign: 'stretch',
  itemsAlign: 'start',
};
