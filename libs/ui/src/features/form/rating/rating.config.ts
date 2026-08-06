import { controlSize } from '../../../types';
import { ratingColor } from './rating.types';

/** Accessible names for the rating's options, overridable for localization. */
export interface RatingLabels {
  /** Accessible name for the option selecting the given star value (whole or half, e.g. 2.5). */
  star: (value: number) => string;
}

export interface RatingConfig {
  color: ratingColor;
  size: controlSize;
  max: number;
  allowHalf: boolean;
  allowClear: boolean;
  preview: boolean;
  /** Accessible names for the options, overridable for localization. */
  labels: RatingLabels;
}

export const DEFAULT_RATING_CONFIG: RatingConfig = {
  color: 'golden',
  size: 'md',
  max: 5,
  allowHalf: false,
  allowClear: true,
  preview: false,
  labels: {
    star: value => (value === 1 ? '1 star' : `${value} stars`),
  },
};
