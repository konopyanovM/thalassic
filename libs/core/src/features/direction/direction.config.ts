import { direction } from './types';

export interface DirectionConfig {
  localStorageKey: string;
  defaultDirection: direction;
}

export const DEFAULT_DIRECTION_CONFIG: DirectionConfig = {
  defaultDirection: 'ltr',
  localStorageKey: 'tls-direction-preference',
};
