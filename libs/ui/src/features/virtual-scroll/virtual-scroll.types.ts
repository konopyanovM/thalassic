import { CdkVirtualForOfContext } from '@angular/cdk/scrolling';

/**
 * Context handed to the item template for every rendered item: the item itself as
 * `$implicit`, plus `index`, `count`, `first`, `last`, `even` and `odd`. `index` and
 * `count` are the item's position and the total in the whole collection, not within
 * the rendered window — which is what makes them usable for `aria-posinset` and
 * `aria-setsize`.
 */
export type VirtualScrollContext<T> = CdkVirtualForOfContext<T>;
