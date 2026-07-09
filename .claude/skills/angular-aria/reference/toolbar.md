# Toolbar — `@angular/aria/toolbar`

Groups related controls with a single tab stop and arrow-key navigation between widgets (`role="toolbar"`).

## Directives

Import from `@angular/aria/toolbar`:

- **`Toolbar`** — `[ngToolbar]`. The container.
- **`ToolbarWidget`** — `[ngToolbarWidget]`. A navigable control within the toolbar.
- **`ToolbarWidgetGroup`** — `[ngToolbarWidgetGroup]`. Groups related widgets (e.g. a radio group).

## Inputs

**Toolbar**

| Input | Type | Default | Purpose |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout / arrow-key axis |
| `disabled` | `boolean` | `false` | Disable the toolbar |
| `softDisabled` | `boolean` | `true` | Disabled items stay focusable |
| `wrap` | `boolean` | `true` | Focus wraps at ends |
| `value` | `V[]` | `[]` | Selected widget values (two-way bindable) |

**ToolbarWidget** — `id: string` (auto), `disabled: boolean` (`false`), `value: V` (required). Exposes `active()` and `selected()` signals.
**ToolbarWidgetGroup** — `disabled: boolean` (`false`), `multi: boolean` (`false`).

## Keyboard

- **Arrow keys** — navigate widgets (Left/Right horizontal, Up/Down vertical; flips for RTL).
- **Enter / Space** — activate widget.
- **Tab** — exit the toolbar (single tab stop).

## Example

```ts
import { Component } from '@angular/core';
import { Toolbar, ToolbarWidget, ToolbarWidgetGroup } from '@angular/aria/toolbar';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  imports: [Toolbar, ToolbarWidget, ToolbarWidgetGroup],
})
export class ToolbarComponent {}
```

```html
<div ngToolbar aria-label="Formatting Tools">
  <button ngToolbarWidget value="bold" #bold="ngToolbarWidget" [attr.aria-pressed]="bold.selected()">
    Bold
  </button>
  <button ngToolbarWidget value="italic" #italic="ngToolbarWidget" [attr.aria-pressed]="italic.selected()">
    Italic
  </button>

  <div ngToolbarWidgetGroup role="radiogroup" aria-label="Alignment">
    <button ngToolbarWidget role="radio" value="left" #left="ngToolbarWidget" [attr.aria-checked]="left.selected()">
      Left
    </button>
    <button ngToolbarWidget role="radio" value="center" #center="ngToolbarWidget" [attr.aria-checked]="center.selected()">
      Center
    </button>
  </div>
</div>
```

Note: bind ARIA state with the `attr.` namespace (`[attr.aria-pressed]`), not a bare property binding.

Source: https://angular.dev/guide/aria/toolbar
