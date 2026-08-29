// Upper bound for how long to keep a closing surface alive so its exit
// (`--leave`) animation can finish before disposal. The `animationend` listener
// settles early; this fallback covers the case where the event never arrives.
export const LEAVE_ANIMATION_FALLBACK_MS = 500;

// Dimmed backdrop behind any modal-grade surface — a centered confirm, a
// bottom sheet. Shared with `tls-dialog` so every modal surface renders an
// identical scrim.
export const MODAL_BACKDROP_CLASS = 'tls-dialog-backdrop';
