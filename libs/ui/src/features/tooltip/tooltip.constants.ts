// Upper bound for how long to keep a detached tooltip pane alive so its
// `animate.leave` can finish. Disposes on `animationend`; this timeout only
// fires when no exit animation runs (e.g. the `none` motion level).
export const LEAVE_ANIMATION_FALLBACK_MS = 500;
