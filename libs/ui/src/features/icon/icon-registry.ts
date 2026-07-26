import { iconRenderer } from './icon-renderer';
import { systemIcon } from './system-icon';

/**
 * A partial override map: any subset of {@link systemIcon} names mapped to a
 * {@link iconRenderer}. Names left unset fall back to the library defaults.
 */
export type iconRegistry = Partial<Record<systemIcon, iconRenderer>>;
