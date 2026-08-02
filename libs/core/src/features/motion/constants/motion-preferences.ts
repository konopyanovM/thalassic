import { motionPreference } from '../types';

/** Every valid {@link motionPreference}, used to validate untrusted values (e.g. localStorage). */
export const MOTION_PREFERENCES: readonly motionPreference[] = [
  'none',
  'essential',
  'full',
  'system',
];
