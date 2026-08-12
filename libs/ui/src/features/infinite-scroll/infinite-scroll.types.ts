/**
 * What the trigger is doing, reflected as a `tls-infinite-scroll--*` host class:
 *
 * - `idle` — watching the scroll edge, nothing rendered;
 * - `loading` — a page is in flight and the watch is suspended;
 * - `manual` — the automatic allowance is spent (or never granted), so the next page waits
 *   on the button;
 * - `complete` — the collection is exhausted and nothing more is requested;
 * - `disabled` — suspended altogether: nothing watched, nothing rendered, the allowance kept.
 */
export type infiniteScrollState = 'idle' | 'loading' | 'manual' | 'complete' | 'disabled';
