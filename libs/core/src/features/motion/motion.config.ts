import { motionPreference } from './types';

export interface MotionConfig {
  localStorageKey: string;
  defaultMotion: motionPreference;
}

export const DEFAULT_MOTION_CONFIG: MotionConfig = {
  defaultMotion: 'system',
  localStorageKey: 'tls-motion-preference',
};
