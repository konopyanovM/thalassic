import { drawerSide, drawerSize } from './drawer.types';

export interface DrawerConfig {
  side: drawerSide;
  size: drawerSize | string;
  closeable: boolean;
  backdropClose: boolean;
  rounded: boolean;
}

export const DEFAULT_DRAWER_CONFIG: DrawerConfig = {
  side: 'end',
  size: 'md',
  closeable: true,
  backdropClose: true,
  rounded: false,
};
