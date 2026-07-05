import { drawerSize } from './drawer.types';

// Upper bound for how long to keep the drawer alive after a close is requested so
// its slide-out (`--leave`) animation can finish before disposal. The `animationend`
// listener disposes early; this fallback covers the case where no exit animation
// runs (e.g. the `none` motion level, where nothing is emitted).
export const LEAVE_ANIMATION_FALLBACK_MS = 500;

// Named size tokens, used to tell a preset apart from a custom CSS-length string.
export const DRAWER_NAMED_SIZES: readonly drawerSize[] = ['sm', 'md', 'lg', 'full'];
