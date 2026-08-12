import { drawerSide, drawerSize } from './drawer.types';

export interface DrawerConfig {
  side: drawerSide;
  size: drawerSize | string;
  closeable: boolean;
  backdropClose: boolean;
  /**
   * Dismisses the drawer on Escape. Independent of {@link DrawerConfig.backdropClose}: a
   * panel that ignores backdrop clicks still owes keyboard users a way out.
   */
  escapeClose: boolean;
  rounded: boolean;
  /**
   * Renders a grabber pill on the edge facing the viewport and makes the panel
   * draggable toward that edge to dismiss. The pill is the affordance for the
   * gesture, so the two are one decision — a visible grabber is always draggable.
   */
  grabber: boolean;
  /** Accessible name for the close button, overridable for localization. */
  closeLabel: string;
}

export const DEFAULT_DRAWER_CONFIG: DrawerConfig = {
  side: 'end',
  size: 'md',
  closeable: true,
  backdropClose: true,
  escapeClose: true,
  rounded: false,
  grabber: false,
  closeLabel: 'Close drawer',
};
