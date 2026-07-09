# Listbox — `@angular/aria/listbox`

Accessible selection list: keyboard navigation, roving focus, type-ahead, single/multi selection, and `role="listbox"` / `role="option"` + `aria-selected` wiring. Foundation for Select, Multiselect, and Autocomplete patterns. Use directly for a visible selection list or a custom selection component.

## Directives

Import from `@angular/aria/listbox`:

- **`Listbox`** — selector `ngListbox`. The container; emits `role="listbox"` and manages active/selected state.
- **`Option`** — selector `ngOption`. An item; emits `role="option"` and `aria-selected`.

## Inputs

| Input | Type | Default | Purpose |
|---|---|---|---|
| `multi` | `boolean` | `false` | Enable multiple selection |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout / arrow-key axis |
| `selectionMode` | `'follow' \| 'explicit'` | `'follow'` | `follow` selects on focus (dropdown-style); `explicit` requires Space/Enter |
| `wrap` | `boolean` | `true` | Focus wraps at the ends |
| `disabled` | `boolean` | `false` | Disable the whole listbox |
| `typeaheadDelay` | `number` | `500` | Type-ahead reset window (ms) |

`Listbox` takes `[value]` (the selected value(s)); `Option` takes `[value]` (its own value).

## Keyboard

- **Arrow keys** — navigate options along `orientation` (horizontal uses Left/Right and flips for RTL via CDK `Directionality`).
- **Home / End** — first / last option.
- **Space / Enter** — select in `explicit` mode.
- **Type-ahead** — jump to options matching typed characters (reset after `typeaheadDelay`).
- **Tab** — move focus out of the listbox.

## Example

```ts
import { Component } from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [Listbox, Option],
})
export class App {
  options = ['Option 1', 'Option 2', 'Option 3'];
}
```

```html
<div ngListbox [value]="['Option 1']">
  @for (option of options; track option) {
    <div ngOption [value]="option">
      {{ option }}
    </div>
  }
</div>
```

## Notes for this repo

- The accessible name goes on the `ngListbox` container via `aria-labelledby` / `aria-label` — not on each `ngOption`.
- Headless: style options/container by class (BEM, `--spacing-*` tokens), never by tag selector.
- For a standard dropdown, prefer the Select / Multiselect primitives which build on listbox, rather than reimplementing open/close on top of a raw listbox.

Source: https://angular.dev/guide/aria/listbox
