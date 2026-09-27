import { Directive, inject, TemplateRef } from '@angular/core';
import { SheetHeaderTemplate } from './sheet.types';

/**
 * Marks the template a `tls-sheet` renders as its header: always visible, the
 * height of the `'header'` detent, and the button that toggles the sheet. It
 * renders inside a native `<button>`, so it holds no interactive content.
 */
@Directive({ selector: 'ng-template[tlsSheetHeader]' })
export class SheetHeaderDirective implements SheetHeaderTemplate {
  public readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
