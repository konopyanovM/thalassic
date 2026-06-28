export interface SkeletonConfig {
  size: number | string | null;
  width: number | string | null;
  height: number | string | null;
  radius: number;
  duration: number;
  rounded: boolean;
  animate: boolean;
}

export const DEFAULT_SKELETON_CONFIG: SkeletonConfig = {
  size: null,
  width: null,
  height: null,
  radius: 8,
  duration: 2500,
  rounded: false,
  animate: true,
};
