import { Component, input, TemplateRef, viewChild } from '@angular/core';

@Component({
  selector: 'tls-menu-item',
  template: `<ng-template #template><ng-content /></ng-template>`,
  host: { style: 'display: none' },
})
export class MenuItemComponent {
  public readonly key = input.required<string>();
  public readonly templateRef = viewChild.required<TemplateRef<unknown>>('template');
}
