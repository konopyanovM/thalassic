import { InjectionToken } from '@angular/core';
import { HapticFeedback } from './haptic-feedback.interface';

/**
 * The haptics the kit's controls play through. Silent unless the app provides
 * one with `provideHapticFeedback`, so a control's taps are opt-in: nothing
 * vibrates in an app that has not decided where haptics belong.
 */
export const HAPTIC_FEEDBACK = new InjectionToken<HapticFeedback>('HAPTIC_FEEDBACK', {
  factory: () => ({ impact: () => undefined }),
});
