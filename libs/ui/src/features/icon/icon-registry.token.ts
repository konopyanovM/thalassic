import { InjectionToken } from '@angular/core';
import { iconRegistry } from './icon-registry';

/**
 * Consumer-supplied overrides for the built-in {@link systemIcon} set, merged
 * over {@link DEFAULT_ICONS} by {@link IconRegistry}. Provide it with
 * `provideThalassicIcons`.
 */
export const ICON_REGISTRY = new InjectionToken<iconRegistry>('ICON_REGISTRY');
