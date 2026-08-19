/** Seconds a single arrow-key or double-tap seek moves the playhead. */
export const DEFAULT_SEEK_STEP = 5;

/** Playback-rate choices offered by the settings menu, in ascending order. */
export const DEFAULT_RATE_OPTIONS: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

/** Milliseconds of pointer idle before the video controls fade out during playback. */
export const DEFAULT_CONTROLS_HIDE_DELAY = 2500;

/** Fraction of full volume (`[0, 1]`) a single arrow-key press applies — 5 on the `[0, 100]` scale. */
export const VOLUME_STEP = 0.05;

/**
 * Milliseconds the transient seek-feedback badge stays visible after a
 * keyboard seek; presses within the window accumulate into one total.
 */
export const SEEK_FEEDBACK_DURATION = 800;
