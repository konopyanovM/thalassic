import { drawerSide, drawerSize } from './drawer.types';

export interface DrawerConfig {
  side: drawerSide;
  size: drawerSize | string;
  closeable: boolean;
  backdropClose: boolean;
  rounded: boolean;
  /** Renders a grabber pill on the edge facing the viewport, the affordance for a sheet-style panel. */
  grabber: boolean;
  /** Accessible name for the close button, overridable for localization. */
  closeLabel: string;
}

export const DEFAULT_DRAWER_CONFIG: DrawerConfig = {
  side: 'end',
  size: 'md',
  closeable: true,
  backdropClose: true,
  rounded: false,
  grabber: false,
  closeLabel: 'Close drawer',
};
