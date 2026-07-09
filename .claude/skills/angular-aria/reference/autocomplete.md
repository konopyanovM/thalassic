# Autocomplete — `@angular/aria/combobox` + `@angular/aria/listbox`

An editable combobox whose popup listbox is filtered by the typed query. Not a standalone package — it is a **composition** of `Combobox` (editable input) and `Listbox` in `activedescendant` focus mode.

## Directives

```ts
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
```

Selectors: `[ngCombobox]`, `[ngComboboxPopup]`, `[ngComboboxWidget]`, `[ngListbox]`, `[ngOption]`.

## Key inputs

**Combobox** — `[(value)]` (input text), `[(expanded)]` (popup open).
**Listbox** — `[(value)]` (selected values `string[]`), `focusMode="activedescendant"`, `selectionMode` (`explicit` prevents auto-select), `tabindex="-1"`, `[activeDescendant]`.
**Option** — `[value]`, `[label]` (accessible text).

## Keyboard

- **Arrow keys** — navigate options.
- **Enter** — select active option and close.
- **Escape** — close popup.
- **Tab** — move away, closing the popup.

## Example

```ts
import { Component, computed, signal, viewChild } from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.html',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule, FormsModule],
})
export class AutocompleteComponent {
  popupExpanded = signal(false);
  query = signal('');
  selectedOption = signal<string[]>([]);

  readonly listbox = viewChild(Listbox);

  countries = computed(() =>
    COUNTRIES.filter((country) => country.toLowerCase().startsWith(this.query().toLowerCase())),
  );

  onCommit(): void {
    const selected = this.selectedOption();
    if (selected.length > 0) this.query.set(selected[0]);
    this.popupExpanded.set(false);
  }
}

const COUNTRIES = ['Afghanistan', 'Albania', 'Algeria'];
```

```html
<div #origin class="autocomplete__input">
  <input #combobox="ngCombobox" ngCombobox
         [(value)]="query" [(expanded)]="popupExpanded"
         placeholder="Select a country" (click)="popupExpanded.set(true)" />
</div>

<ng-template [cdkConnectedOverlay]="{ origin, usePopover: 'inline' }"
             [cdkConnectedOverlayOpen]="popupExpanded()">
  <ng-template ngComboboxPopup [combobox]="combobox">
    <div #listbox="ngListbox" ngListbox ngComboboxWidget
         focusMode="activedescendant" [activeDescendant]="listbox.activeDescendant()"
         [(value)]="selectedOption" (click)="onCommit()" (keydown.enter)="onCommit()">
      @for (country of countries(); track country) {
        <div ngOption [value]="country" [label]="country">{{ country }}</div>
      }
    </div>
  </ng-template>
</ng-template>
```

See also `combobox.md`, `listbox.md`.

Source: https://angular.dev/guide/aria/autocomplete
