// Upper bound for how long to keep a closing surface alive so its exit
// (`--leave`) animation can finish before disposal. The `animationend` listener
// settles early; this fallback covers the case where the event never arrives.
export const LEAVE_ANIMATION_FALLBACK_MS = 500;
