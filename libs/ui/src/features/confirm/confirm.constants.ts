// Upper bound for how long to keep a detached confirm pane alive so its
// `animate.leave` can finish. Disposes on `animationend`; this timeout only
// fires when no exit animation runs (e.g. the `none` motion level).
export const LEAVE_ANIMATION_FALLBACK_MS = 500;

// Dimmed backdrop behind a centered modal confirm. Shared with `tls-dialog` so
// the two modal surfaces render an identical scrim.
export const MODAL_BACKDROP_CLASS = 'tls-dialog-backdrop';
