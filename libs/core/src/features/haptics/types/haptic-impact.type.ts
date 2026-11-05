/**
 * How heavy an impact a haptic tap reads as, in the three weights the platforms
 * share (iOS `UIImpactFeedbackGenerator`, Android's haptic constants): `light`
 * for a gesture crossing a threshold, heavier for a collision or a commitment.
 */
export type hapticImpact = 'light' | 'medium' | 'heavy';
