import { InjectionToken, Signal } from '@angular/core';

/** The kind of popup a trigger opens, as `aria-haspopup` names it. */
export type popupKind = 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';

/**
 * What a trigger directive announces about the popup it opens. Read by a host whose focusable
 * element is not the host itself — a button rendering its own `<button>` — so the announcement
 * lands on the element that takes focus, where a screen reader looks for it.
 */
export interface PopupTrigger {
  /** The kind of popup, for `aria-haspopup`. */
  readonly popupKind: popupKind;
  /** Whether the popup is open, for `aria-expanded`. */
  readonly popupExpanded: Signal<boolean>;
  /** The open popup's element id, for `aria-controls`; none while it is closed. */
  readonly popupId: Signal<string | null>;
}

/** Provided by a trigger directive for the host it sits on; see {@link PopupTrigger}. */
export const POPUP_TRIGGER = new InjectionToken<PopupTrigger>('POPUP_TRIGGER');

/**
 * Provided by a host that renders its own focusable control and places a trigger's announcement
 * on it, so a trigger directive on that host leaves the host's own attributes alone. A plain value
 * rather than the host itself, so a trigger can ask without constructing what it sits on.
 */
export const POPUP_TRIGGER_FORWARDED = new InjectionToken<boolean>('POPUP_TRIGGER_FORWARDED');
