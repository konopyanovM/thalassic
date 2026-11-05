import { EnvironmentProviders, makeEnvironmentProviders, Type } from '@angular/core';
import { HAPTIC_FEEDBACK, HapticFeedback } from '../features';

/**
 * Routes the kit controls' haptic taps through the app's own implementation,
 * which must itself be injectable (provided in root or alongside this call).
 */
export const provideHapticFeedback = (
  implementation: Type<HapticFeedback>,
): EnvironmentProviders => {
  return makeEnvironmentProviders([{ provide: HAPTIC_FEEDBACK, useExisting: implementation }]);
};
