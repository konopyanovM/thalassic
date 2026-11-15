/**
 * Custom properties the component writes. `--tls-sheet-offset` is the engine's
 * property; the two others are read by the theme and by pages.
 */
export const SHEET_OFFSET_PROPERTY = '--tls-sheet-offset';
export const SHEET_HEIGHT_PROPERTY = '--tls-sheet-height';
export const SHEET_COLLAPSED_SIZE_PROPERTY = '--tls-sheet-collapsed-size';

/**
 * The overlay pane the sheet is attached to; the theme makes it a query container.
 */
export const SHEET_PANE_CLASS = 'tls-sheet-pane';

/**
 * The room the theme keeps clear above the sheet's tallest height, as a CSS
 * length; the component measures it to cap every detent.
 */
export const SHEET_TOP_CLEARANCE_PROPERTY = '--tls-sheet-top-clearance';

/**
 * The px a pull past the smallest or largest detent approaches but never
 * reaches (see `rubberBand`).
 */
export const SHEET_STRETCH_LIMIT = 48;
