import { controlSize } from '../../../types';
import { sliderColor } from './slider.types';

export interface SliderConfig {
  color: sliderColor;
  size: controlSize;
  fluid: boolean;
  min: number;
  max: number;
  step: number;
  showTooltip: boolean;
}

export const DEFAULT_SLIDER_CONFIG: SliderConfig = {
  color: 'primary',
  size: 'md',
  fluid: false,
  min: 0,
  max: 100,
  step: 1,
  showTooltip: false,
};
