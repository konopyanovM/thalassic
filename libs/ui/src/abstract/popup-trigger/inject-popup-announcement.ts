import { computed, inject, Signal } from '@angular/core';
import { POPUP_TRIGGER } from './popup-trigger';

/** A trigger directive's popup, as a host places it on the inner control that takes focus. */
export interface PopupAnnouncement {
  /** `aria-haspopup`: the kind of popup, while a trigger sits on the host. */
  readonly kind: string | null;
  /** `aria-expanded`: whether the popup is open, while a trigger sits on the host. */
  readonly expanded: Signal<boolean | null>;
  /** `aria-controls`: the open popup's id. */
  readonly id: Signal<string | null>;
}

/**
 * Reads the popup a trigger directive on this host announces, for a host whose focusable element
 * is a control it renders inside itself. Pair it with providing `POPUP_TRIGGER_FORWARDED`, so the
 * trigger leaves the host's own attributes alone. Call it in an injection context.
 */
export function injectPopupAnnouncement(): PopupAnnouncement {
  const trigger = inject(POPUP_TRIGGER, { self: true, optional: true });

  return {
    kind: trigger ? trigger.popupKind : null,
    expanded: computed(() => (trigger ? trigger.popupExpanded() : null)),
    id: computed(() => (trigger ? trigger.popupId() : null)),
  };
}
