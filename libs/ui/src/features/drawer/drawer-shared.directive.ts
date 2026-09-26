import { Directive, input } from '@angular/core';

/**
 * Pairs an element inside a drawer's origin with its counterpart inside the
 * drawer, by a key the two share. As the drawer slides out of its origin, the
 * counterpart travels from where its partner stands to its own place, and back
 * again as the drawer closes — a heading that reads the same in both, carried
 * across rather than shown twice.
 *
 * The counterpart is moved with a transform, so it needs a box: a block or
 * inline-block element, or any flex or grid item.
 */
@Directive({
  selector: '[tlsDrawerShared]',
  // Written out: host metadata is read statically. It names the attribute
  // `DRAWER_SHARED_ATTRIBUTE` holds, which the drawer queries by.
  host: {
    '[attr.data-tls-drawer-shared]': 'key()',
  },
})
export class DrawerSharedDirective {
  // Inputs
  /** The key pairing this element with its counterpart; unique within each side. */
  public readonly key = input.required<string>({ alias: 'tlsDrawerShared' });
}
