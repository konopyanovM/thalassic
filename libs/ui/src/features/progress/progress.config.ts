import { controlSize } from '../../types';
import { progressColor } from './progress.types';

export interface ProgressConfig {
  max: number;
  color: progressColor;
  size: controlSize;
  activeSegmentScale: number;
}

export const DEFAULT_PROGRESS_CONFIG: ProgressConfig = {
  max: 100,
  color: 'primary',
  size: 'md',
  activeSegmentScale: 2,
};
