# Multiselect — `@angular/aria/combobox` + `@angular/aria/listbox`

A multi-select dropdown: a combobox trigger opening a multi-selection listbox (`multi`). A **composition**, not a standalone package. Space toggles options and keeps the popup open. This repo has a themed multi-select (`libs/themes/.../components/multi-select`) — check it first.

## Directives

```ts
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
```

Selectors: `[ngCombobox]`, `[ngComboboxPopup]`, `[ngComboboxWidget]`, `[ngListbox]`, `[ngOption]`.

## Key inputs

**Combobox** — `[(expanded)]`, `[preserveContent]`.
**Listbox** — `[multi]="true"`, `[(value)]` (`string[]`), `focusMode="activedescendant"`, `selectionMode="explicit"`, `[activeDescendant]`, `tabindex`.
**Option** — `[value]`, `[label]`, `[disabled]`.

## Keyboard

- **Arrow Up / Down** — navigate options.
- **Space** — toggle selection (popup stays open).
- **Escape** — close popup.
- **Tab** — exit component.

## Example

```ts
import { Component, signal, viewChild } from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-multiselect',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
  templateUrl: './multiselect.html',
})
export class MultiselectComponent {
  selectedValues = signal<string[]>([]);
  popupExpanded = signal(false);
  readonly listbox = viewChild(Listbox);
  options = ['Option A', 'Option B', 'Option C'];
}
```

```html
<div #combobox="ngCombobox" ngCombobox [(expanded)]="popupExpanded">
  <span>{{ selectedValues().join(', ') || 'Select items' }}</span>
</div>

<ng-template [cdkConnectedOverlay]="{ origin: combobox }" [cdkConnectedOverlayOpen]="popupExpanded()">
  <ng-template ngComboboxPopup [combobox]="combobox">
    <div #listbox="ngListbox" ngListbox [multi]="true" ngComboboxWidget
         focusMode="activedescendant" [(value)]="selectedValues">
      @for (option of options; track option) {
        <div ngOption [value]="option">{{ option }}</div>
      }
    </div>
  </ng-template>
</ng-template>
```

See also `combobox.md`, `listbox.md`, `select.md`.

Source: https://angular.dev/guide/aria/multiselect
