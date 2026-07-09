# Menu — `@angular/aria/menu`

Accessible popup menu with keyboard navigation, type-ahead, and nested submenus. Emits `role="menu"` / `role="menuitem"` and manages `aria-expanded` on the trigger.

## Directives

Import from `@angular/aria/menu`:

- **`MenuTrigger`** — `[ngMenuTrigger]`. Element that opens/closes the menu; takes `[menu]`.
- **`Menu`** — `[ngMenu]`. The menu container.
- **`MenuContent`** — `[ngMenuContent]`. Structural directive (`ng-template`) wrapping the items.
- **`MenuItem`** — `[ngMenuItem]`. An action item.

## Inputs

**MenuTrigger** — `menu: Menu<T>` (menu to control), `disabled: boolean` (default `false`). Exposes `expanded()`.
**MenuItem** — `value: T`, `disabled: boolean` (`false`), `softDisabled: boolean` (`false`, focusable but not selectable), `submenu: Menu<T> | null` (nested menu).
**Menu** — exposes `visible(): Signal<boolean>`.

## Keyboard

- **Arrow Up / Down** — navigate items.
- **Home / End** — first / last item.
- **Enter / Space** — select focused item.
- **Escape** — close menu.
- **Character keys** — type-ahead jump.
- **Arrow Right / Left** — open / close submenu.

## Example

```ts
import { Component, viewChild } from '@angular/core';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.html',
  imports: [Menu, MenuContent, MenuItem, MenuTrigger, OverlayModule],
})
export class MenuComponent {
  mainMenu = viewChild<Menu<string>>('mainMenu');
}
```

```html
<button ngMenuTrigger #origin #trigger="ngMenuTrigger" [menu]="mainMenu()">Open Menu</button>

<ng-template
  [cdkConnectedOverlayOpen]="trigger.expanded()"
  [cdkConnectedOverlay]="{ origin, usePopover: 'inline' }"
  [cdkConnectedOverlayPositions]="[
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 }
  ]"
  cdkAttachPopoverAsChild>
  <div ngMenu #mainMenu="ngMenu">
    <ng-template ngMenuContent>
      <div ngMenuItem value="Edit">Edit</div>
      <div ngMenuItem value="Copy">Copy</div>
      <div ngMenuItem value="Delete">Delete</div>
    </ng-template>
  </div>
</ng-template>
```

CDK overlay positions use logical `originX`/`overlayX: 'start' | 'end'`, which flip for RTL on their own — do not hardcode `'left'`/`'right'`. This repo already has a `tls-menu` (`libs/ui/src/features/menu`).

Source: https://angular.dev/guide/aria/menu
