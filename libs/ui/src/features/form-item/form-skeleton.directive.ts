import { booleanAttribute, Directive, input } from '@angular/core';

/**
 * Draws every form item beneath it as a skeleton, and makes everything beneath
 * it inert, for a form whose values are still being read. One binding on the
 * form, or on any element around its fields, reaches the items however deep
 * they sit, those inside other components included, so a form is rendered once
 * from its blank model rather than written out a second time as a placeholder.
 */
@Directive({
  selector: '[tlsFormSkeleton]',
  host: { '[attr.inert]': "active() ? '' : null" },
})
export class FormSkeleton {
  // Inputs
  /** Whether the values are still being read. */
  public readonly active = input<boolean, unknown>(false, {
    alias: 'tlsFormSkeleton',
    transform: booleanAttribute,
  });
}
