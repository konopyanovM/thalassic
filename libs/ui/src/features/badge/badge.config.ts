import { controlSize } from '../../types';
import { badgeColor, badgePosition } from './badge.types';

export interface BadgeConfig {
  color: badgeColor;
  position: badgePosition;
  size: controlSize;
  max: number;
}

export const DEFAULT_BADGE_CONFIG: BadgeConfig = {
  color: 'primary',
  position: 'top-end',
  size: 'md',
  max: 99,
};
