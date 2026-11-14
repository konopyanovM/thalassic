import { tabsVariant } from './tabs.types';

/**
 * The treatments whose selection is marked by a fill with a shape of its own —
 * a pill on a track, a row of a list — which can travel from the tab it leaves
 * to the one selected next. The others mark a tab by its edges, which belong
 * to the tab and stay with it.
 */
export const SLIDING_TABS_VARIANTS: ReadonlySet<tabsVariant> = new Set(['segmented', 'grouped']);
