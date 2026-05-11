export interface SkeletonConfig {
  size: number;
  width: number | null;
  height: number | null;
  radius: number;
  duration: number;
  rounded: boolean;
  animate: boolean;
}

export const DEFAULT_SKELETON_CONFIG: SkeletonConfig = {
  size: 40,
  width: null,
  height: null,
  radius: 8,
  duration: 2500,
  rounded: false,
  animate: true,
};
