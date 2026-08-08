import { radius } from '../../types';

export interface SkeletonConfig {
  size: number | string | null;
  width: number | string | null;
  height: number | string | null;
  radius: radius;
  duration: number;
  rounded: boolean;
  animate: boolean;
}

export const DEFAULT_SKELETON_CONFIG: SkeletonConfig = {
  size: null,
  width: null,
  height: null,
  radius: 'md',
  duration: 2500,
  rounded: false,
  animate: true,
};
