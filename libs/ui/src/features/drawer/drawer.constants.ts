import { drawerSize } from './drawer.types';

// Named size tokens, used to tell a preset apart from a custom CSS-length string.
export const DRAWER_NAMED_SIZES: readonly drawerSize[] = ['sm', 'md', 'lg', 'full', 'auto'];


// Theme tokens the slide from an origin is timed by — the same the plain slide
// uses, so a drawer moves alike whichever way it opened.
export const DRAWER_SLIDE_DURATION_TOKEN = '--motion-default';
export const DRAWER_SLIDE_ENTER_EASING_TOKEN = '--motion-ease-out';
export const DRAWER_SLIDE_LEAVE_EASING_TOKEN = '--motion-ease-in';

// Slack (px) allowed when checking that the origin lies within the panel, for
// sub-pixel rounding between two separately laid-out boxes.
export const DRAWER_ORIGIN_TOLERANCE = 1;

// Attribute pairing an element inside a drawer's origin with its counterpart
// inside the drawer; written by `DrawerSharedDirective`.
export const DRAWER_SHARED_ATTRIBUTE = 'data-tls-drawer-shared';
