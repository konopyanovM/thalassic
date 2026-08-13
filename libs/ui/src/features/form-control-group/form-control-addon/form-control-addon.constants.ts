/**
 * Content that handles its own clicks. A click landing on one of these belongs to that
 * element — a button runs its action, a link navigates, a nested field takes the caret
 * — so the addon leaves it alone instead of pulling focus away to the field's control.
 */
export const INTERACTIVE_ADDON_CONTENT_SELECTOR =
  'button, a[href], input, select, textarea, label, [contenteditable], [tabindex]:not([tabindex="-1"])';
