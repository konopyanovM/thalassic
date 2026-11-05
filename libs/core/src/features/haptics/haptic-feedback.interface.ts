import { hapticImpact } from './types';

/**
 * Plays the taps the kit's controls give at the moments a native control would,
 * such as a gesture crossing the point past which releasing commits it. The kit
 * names the moment and the weight; the app decides how a tap reaches the device
 * — a native bridge, the Vibration API, or nothing at all — since the web has
 * no haptics API of its own and the right answer depends on where the app runs.
 */
export interface HapticFeedback {
  /** Plays one impact tap of the given weight. Must not throw where the device has no haptics. */
  impact(weight: hapticImpact): void;
}
