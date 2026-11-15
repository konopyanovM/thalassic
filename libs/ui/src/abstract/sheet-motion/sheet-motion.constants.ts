/**
 * Custom properties a settle writes on the surface and its scrim, for a
 * stylesheet's settle transition to read: the duration in `ms` and a `linear()`
 * easing that traces the spring's travel.
 */
export const SETTLE_DURATION_PROPERTY = '--tls-settle-duration';
export const SETTLE_EASING_PROPERTY = '--tls-settle-easing';

/**
 * Period in ms of the settle spring's undamped swing — SwiftUI's `response`.
 * Critically damped at this response, a settle from rest covers nine tenths of
 * its travel in about 200ms, on a par with an overlay's default motion.
 */
export const SETTLE_SPRING_RESPONSE = 320;

/**
 * Distance in px from the target at which a settle counts as arrived: the
 * transition ends there and the last fraction of a pixel lands in one step.
 */
export const SETTLE_REST_DISTANCE = 0.5;

/** Longest a settle may run, in ms, however far it travels. */
export const SETTLE_MAX_DURATION = 1000;

/** Spacing in ms of the points the `linear()` easing samples: one 60Hz frame. */
export const SETTLE_SAMPLE_INTERVAL = 1000 / 60;

/**
 * Share of the finger's travel a rubber band follows at its very start —
 * UIScrollView's constant, so a stretch reads like the platform's.
 */
export const RUBBER_BAND_RESISTANCE = 0.55;
