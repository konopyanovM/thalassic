import { drawerGrabber, drawerSide, drawerSize } from './drawer.types';

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
   * `auto` shows it on a bottom sheet only.
   */
  grabber: drawerGrabber;
  /** Accessible name for the close button, overridable for localization. */
  closeLabel: string;
}

/**
 * One panel's configuration, every choice made: the defaults and the open
 * config merged, with `grabber` resolved for the panel's side.
 */
export interface DrawerPanelConfig extends Omit<DrawerConfig, 'grabber'> {
  grabber: boolean;
}

export const DEFAULT_DRAWER_CONFIG: DrawerConfig = {
  side: 'end',
  size: 'md',
  closeable: true,
  backdropClose: true,
  escapeClose: true,
  rounded: false,
  grabber: 'auto',
  closeLabel: 'Close drawer',
};
