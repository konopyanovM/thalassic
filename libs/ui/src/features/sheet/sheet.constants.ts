// Custom properties the component writes. `--tls-sheet-offset` is the engine's
// property; the two others are read by the theme and by pages.
export const SHEET_OFFSET_PROPERTY = '--tls-sheet-offset';
export const SHEET_HEIGHT_PROPERTY = '--tls-sheet-height';
export const SHEET_COLLAPSED_SIZE_PROPERTY = '--tls-sheet-collapsed-size';

// The overlay pane the sheet is attached to; the theme makes it a query container.
export const SHEET_PANE_CLASS = 'tls-sheet-pane';

// A pull below the smallest detent gives this share of the overshoot, capped,
// so the end of the travel reads as a stretch rather than a wall.
export const SHEET_OVERSHOOT_DIVISOR = 3;
export const SHEET_OVERSHOOT_MAX = 32;
