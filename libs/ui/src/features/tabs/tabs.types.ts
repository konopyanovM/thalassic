import { orientation } from '../../types';

export type tabsVariant = 'flat' | 'outlined' | 'segmented';

export type tabsOrientation = orientation;

export type tabsHeaderPosition = 'start' | 'end';

/**
 * Placement of the header strip along the tabs container's cross axis, mapped
 * onto `align-self` (direction-aware: `start`/`end` follow the layout
 * direction). Anything but `stretch` shrinks the strip to its tabs instead of
 * filling the content panel's extent — the point of a segmented track in
 * vertical orientation. On `flat` and `outlined` it also shortens the divider
 * rule to the tabs' extent, since the rule is drawn on the strip's own border.
 */
export type tabsHeaderAlign = 'stretch' | 'start' | 'center' | 'end';

/**
 * Distribution of the tabs within the header strip along its main axis.
 * `start`, `center` and `end` map onto `justify-content` and so only take
 * effect while the strip has free space to distribute — a non-stretch
 * {@link tabsHeaderAlign} leaves none. `stretch` instead grows every tab to an
 * equal share of the strip.
 */
export type tabsItemsAlign = 'start' | 'center' | 'end' | 'stretch';

export type tabValue = string;
