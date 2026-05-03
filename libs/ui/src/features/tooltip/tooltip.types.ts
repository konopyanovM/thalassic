import { color } from '../../types';

export type tooltipOrigin = 'cursor' | 'element';

export type tooltipPosition =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type tooltipColor = color;
