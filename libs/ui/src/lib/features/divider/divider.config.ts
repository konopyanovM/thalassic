import { dividerContentPosition, dividerOrientation, dividerVariant } from './divider.types';

export interface DividerConfig {
  orientation: dividerOrientation;
  position: dividerContentPosition;
  variant: dividerVariant;
  flush: boolean;
}

export const DEFAULT_DIVIDER_CONFIG: DividerConfig = {
  orientation: 'horizontal',
  position: 'center',
  variant: 'solid',
  flush: false,
};
