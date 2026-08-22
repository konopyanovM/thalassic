import { controlSize } from '../../../types';

/** Color channel a range slider drives. */
export type colorRangeChannel = 'hue' | 'alpha';

/** Control sizes plus an extra-small variant for dense inline use. */
export type colorRangeSize = 'xs' | controlSize;
