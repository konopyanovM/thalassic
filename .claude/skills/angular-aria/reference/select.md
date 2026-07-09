# Select — `@angular/aria/combobox` + `@angular/aria/listbox`

A single-select dropdown: a non-editable combobox trigger opening a single-selection listbox. A **composition**, not a standalone package. This repo already has a themed select (`libs/themes/.../components/select`) and an `abstract-select` base in `libs/ui/src/abstract/form` — check those before building a new one.

## Directives

```ts
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
```

Selectors: `[ngCombobox]`, `[ngComboboxPopup]`, `[ngComboboxWidget]`, `[ngListbox]`, `[ngOption]`.

## Key inputs

**Combobox** — `[(expanded)]`, `[preserveContent]`.
**Listbox** — `[(value)]` (`string[]`), `focusMode="activedescendant"`, `selectionMode="explicit"` (single), `[activeDescendant]`, `tabindex="-1"`.
**Option** — `[value]`, `[label]`.

## Keyboard

- **Arrow keys** — navigate options.
- **Enter / Space** — select active option and close.
- **Escape** — close without selecting.

## Example

```ts
import { Component, signal, viewChild, computed, afterRenderEffect } from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-select',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
  template: `
    <div ngCombobox #combobox="ngCombobox" [(expanded)]="expanded" [preserveContent]="true" class="select">
      {{ selectedValue() }}
    </div>
    <ng-template [cdkConnectedOverlay]="{ origin: combobox.element }" [cdkConnectedOverlayOpen]="expanded()">
      <ng-template ngComboboxPopup [combobox]="combobox">
        <div #listbox="ngListbox" ngListbox ngComboboxWidget
             focusMode="activedescendant" selectionMode="explicit"
             [(value)]="values" [activeDescendant]="listbox.activeDescendant()" (keydown.enter)="close()">
          @for (item of items; track item) {
            <div ngOption [value]="item">{{ item }}</div>
          }
        </div>
      </ng-template>
    </ng-template>
  `,
})
export class SelectComponent {
  readonly listbox = viewChild(Listbox);
  readonly values = signal<string[]>([]);
  readonly expanded = signal(false);
  readonly selectedValue = computed(() => this.values()[0] || 'Select');
  readonly items = ['Option 1', 'Option 2', 'Option 3'];

  close(): void {
    this.expanded.set(false);
  }

  constructor() {
    afterRenderEffect(() => {
      const listbox = this.listbox();
      if (listbox) listbox.scrollActiveItemIntoView();
    });
  }
}
```

See also `combobox.md`, `listbox.md`, `multiselect.md`.

Source: https://angular.dev/guide/aria/select
