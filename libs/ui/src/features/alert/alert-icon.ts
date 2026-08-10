import { Directive } from '@angular/core';

/**
 * Marks an element as the alert's leading icon. Projected content wins over the
 * color-derived built-in glyph, so any visual — an icon, an avatar, a spinner —
 * can take the icon slot.
 */
@Directive({
  selector: '[tlsAlertIcon]',
  host: { class: 'tls-alert__icon' },
})
export class AlertIcon {}
