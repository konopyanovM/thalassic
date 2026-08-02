// Base stacking order applied to the front toast; toasts further back subtract
// their depth from this so the newest always paints on top.
export const TOAST_BASE_Z_INDEX = 1000;

// Collapsed-pile geometry. `PEEK` is how far (px) each toast behind the front one
// is pushed toward the viewport center so its edge shows; `SCALE_STEP` shrinks it
// per depth; `VISIBLE_DEPTH` is how many toasts behind the front stay visible
// before the rest fade out.
export const TOAST_COLLAPSED_PEEK = 14;
export const TOAST_COLLAPSED_SCALE_STEP = 0.05;
export const TOAST_COLLAPSED_MIN_SCALE = 0.8;
export const TOAST_COLLAPSED_VISIBLE_DEPTH = 3;

// Vertical gap (px) between toasts when the stack is expanded into a list. Kept
// in sync with `--spacing-3` in `_toast.scss`; it is a transform offset computed
// in TypeScript, so it lives here as a number rather than a spacing token.
export const TOAST_EXPANDED_GAP = 12;
