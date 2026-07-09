# Combobox — `@angular/aria/combobox`

Coordinates an input/trigger element with a popup widget (usually a listbox). The shared foundation for the **Select**, **Multiselect**, and **Autocomplete** patterns — those are combobox + listbox compositions (see their reference files).

## Directives

Import from `@angular/aria/combobox`:

- **`Combobox`** — `[ngCombobox]`. The trigger/input; coordinates popup visibility and value.
- **`ComboboxPopup`** — `[ngComboboxPopup]`. Structural directive marking the popup template content; takes `[combobox]`.
- **`ComboboxWidget`** — `[ngComboboxWidget]`. Applied to the widget inside the popup (e.g. the `ngListbox`).

## Inputs

**Combobox**

| Input | Type | Purpose |
|---|---|---|
| `value` | `Signal<string>` | Input value — two-way bindable `[(value)]` |
| `expanded` | `Signal<boolean>` | Popup visibility — two-way bindable `[(expanded)]` |
| `preserveContent` | `boolean` | Retain popup content when collapsed (default `false`) |

**ComboboxPopup**: `combobox` — reference to the parent `Combobox`.

## Keyboard

- **Arrow keys** — navigate popup options.
- **Enter** — select active option / commit.
- **Escape** — close popup.
- **Space** — toggle popup / select when focused on the trigger.
- **Tab** — move focus away; closes the popup.

## Example

```ts
import { Component, signal, computed } from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-combobox',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule, FormsModule],
  template: `
    <input #combobox="ngCombobox" ngCombobox [(value)]="query" [(expanded)]="expanded" />
    <ng-template ngComboboxPopup [combobox]="combobox">
      <div #listbox="ngListbox" ngListbox ngComboboxWidget>
        @for (item of filtered(); track item) {
          <div ngOption [value]="item">{{ item }}</div>
        }
      </div>
    </ng-template>
  `,
})
export class ComboboxComponent {
  query = signal('');
  expanded = signal(false);
  items = ['Apple', 'Banana', 'Cherry'];
  filtered = computed(() =>
    this.items.filter((item) => item.toLowerCase().includes(this.query().toLowerCase())),
  );
}
```

The popup is positioned with CDK `cdkConnectedOverlay`; this repo's overlay abstractions live in `libs/ui/src/abstract/overlay`.

Source: https://angular.dev/guide/aria/combobox
