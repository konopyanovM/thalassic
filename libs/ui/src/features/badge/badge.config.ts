import { controlSize } from '../../types';
import { badgeColor, badgePosition, badgeVariant } from './badge.types';

export interface BadgeConfig {
  color: badgeColor;
  variant: badgeVariant;
  position: badgePosition;
  size: controlSize;
  max: number;
}

export const DEFAULT_BADGE_CONFIG: BadgeConfig = {
  color: 'primary',
  variant: 'filled',
  position: 'top-end',
  size: 'md',
  max: 99,
};
