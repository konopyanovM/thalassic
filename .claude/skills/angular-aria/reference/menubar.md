# Menubar — `@angular/aria/menu`

A horizontal bar of menu triggers, like a desktop application's menu bar (File, Edit, View…). **Not a separate package** — `MenuBar` is exported from the **`@angular/aria/menu`** entry point alongside `Menu`, `MenuItem`, and `MenuTrigger`. (This is why there is no `guide/aria/menubar` doc page — menubar ships within the menu module.)

Emits `role="menubar"` and coordinates a row of `ngMenuTrigger` buttons, each opening an `ngMenu` popup.

## Directives

Import from `@angular/aria/menu`:

- **`MenuBar`** — selector `[ngMenuBar]`, exportAs `ngMenuBar`. The horizontal container of triggers.
- **`MenuTrigger`** — `[ngMenuTrigger]`. A top-level bar button; takes `[menu]`.
- **`Menu`** — `[ngMenu]`. The popup opened by a trigger.
- **`MenuItem`** — `[ngMenuItem]`. An item inside a menu (or a submenu trigger via `[submenu]`).

## Inputs (`MenuBar<V>`)

| Input | Type | Default | Purpose |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Disable the whole menubar |
| `softDisabled` | `boolean` | `true` | Disabled items stay focusable (`true`) vs skipped (`false`) |
| `value` | `V[]` | `[]` | Selected item value(s) — two-way bindable `[(value)]` |
| `wrap` | `boolean` | `true` | Keyboard navigation wraps at the ends |
| `typeaheadDelay` | `number` | `500` | Type-ahead buffer reset window (ms) |

## Outputs & methods

- `valueChange` — emitted via the two-way `value` model.
- `itemSelected: OutputEmitterRef<V>` — emits the value when a menu item is chosen.
- `close(): void` — closes the menubar's open menu.

## Keyboard

- **Arrow Left / Right** — move between top-level triggers (flips for RTL; the directive tracks direction via CDK bidi).
- **Arrow Down / Enter / Space** — open the focused trigger's menu.
- **Arrow Up / Down** — navigate items within an open menu; **Arrow Right / Left** open/close submenus.
- **Type-ahead** — jump to a trigger/item by typing.
- **Escape** — close the open menu.

## Example

```ts
import { Component } from '@angular/core';
import { Menu, MenuBar, MenuItem, MenuTrigger } from '@angular/aria/menu';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.html',
  imports: [MenuBar, MenuTrigger, Menu, MenuItem],
})
export class MenubarComponent {}
```

```html
<div ngMenuBar>
  <button ngMenuTrigger [menu]="fileMenu">File</button>
  <button ngMenuTrigger [menu]="editMenu">Edit</button>
</div>

<div ngMenu #fileMenu="ngMenu">
  <div ngMenuItem>New</div>
  <div ngMenuItem>Open</div>
</div>

<div ngMenu #editMenu="ngMenu">
  <div ngMenuItem>Cut</div>
  <div ngMenuItem>Copy</div>
</div>
```

## Notes for this repo

- The menu popups are placed with CDK overlay (see `menu.md`); use logical `originX`/`overlayX: 'start' | 'end'` so positions flip in RTL — never hardcode `'left'`/`'right'`.
- Headless: style the bar/triggers/items by class (BEM, `--spacing-*` tokens), never by tag selector.

Source: `@angular/aria@22.0.4` type definitions (`node_modules/@angular/aria/types/menu.d.ts`) — the `guide/aria/menubar` doc page is not published; menubar is documented inline within the menu module.
