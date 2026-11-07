import { inject, Provider } from '@angular/core';
import { deepMerge } from '@thalassic/core';
import { FormItemConfig } from './form-item.config';
import { FORM_ITEM_CONFIG } from './form-item.token';

/**
 * Overrides the form item config for one part of the view tree: listed in a component's or a
 * directive's `providers`, it applies to every `tls-form-item` beneath it, on top of whatever
 * the surrounding scope configures — the app-wide `provideThalassicUIConfig`, or an enclosing
 * override. Keys set to `undefined` are cleared, so `{ optionalText: undefined }` drops the
 * optional marker from a form whose every field may be skipped.
 *
 * @example
 * // App-wide: formItem: { optionalText: '(optional)', reserveErrorSpace: false }
 * @Component({ providers: [provideFormItemConfig({ optionalText: undefined })] })
 * // Inside: no optional marker, and still no reserved error space.
 */
export const provideFormItemConfig = (config: Partial<FormItemConfig>): Provider => ({
  provide: FORM_ITEM_CONFIG,
  useFactory: (): FormItemConfig => deepMerge(inject(FORM_ITEM_CONFIG, { skipSelf: true }), config),
});
