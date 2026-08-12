import { drawerSize } from './drawer.types';

// Named size tokens, used to tell a preset apart from a custom CSS-length string.
export const DRAWER_NAMED_SIZES: readonly drawerSize[] = ['sm', 'md', 'lg', 'full', 'auto'];

// Fraction of the panel's extent a drag must cover for the release to dismiss
// rather than snap back. A flick commits regardless of distance, so this only
// governs slow drags, where releasing past the panel's midpoint would feel late.
export const DRAWER_DISMISS_RATIO = 0.4;

// Pointer types allowed to drag the panel. Dragging a panel shut is a touch
// idiom; on a mouse the drag would instead fight text selection through the
// gesture's slop, and the close button and Escape already serve that pointer.
export const DRAWER_DRAG_POINTER_TYPES: readonly string[] = ['touch', 'pen'];
