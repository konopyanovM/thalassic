import { computed, inject, Signal } from '@angular/core';
import { FormSkeleton } from './form-skeleton.directive';

/**
 * Whether the form around the caller is drawn as a skeleton: what the nearest
 * `tlsFormSkeleton` above it says, and never where there is none. For a part
 * of a form that is not a form item, a list or an upload, say, to stand in
 * for itself at the same moment the items around it do. Called in an injection
 * context.
 */
export function injectFormSkeleton(): Signal<boolean> {
  const formSkeleton = inject(FormSkeleton, { optional: true });
  if (!formSkeleton) return computed(() => false);

  return formSkeleton.active;
}
