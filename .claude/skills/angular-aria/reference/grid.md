# Grid — `@angular/aria/grid`

Accessible interactive grid with 2D arrow-key navigation, cell selection, spanning, and embedded widgets (`role="grid"` / `role="row"` / `role="gridcell"`). For an interactive data grid — not a static layout.

## Directives

Import from `@angular/aria/grid`:

- **`Grid`** — `[ngGrid]`. The container.
- **`GridRow`** — `[ngGridRow]`. A row.
- **`GridCell`** — `[ngGridCell]`. A cell.
- **`GridCellWidget`** — `[ngGridCellWidget]`. An interactive control inside a cell.

## Inputs

**Grid**

| Input | Type | Default | Purpose |
|---|---|---|---|
| `enableSelection` | `boolean` | `false` | Enable cell selection |
| `disabled` | `boolean` | `false` | Disable the grid |
| `softDisabled` | `boolean` | `true` | Disabled cells stay focusable |
| `focusMode` | `'roving' \| 'activedescendant'` | `'roving'` | Focus strategy |
| `rowWrap` | `'continuous' \| 'loop' \| 'nowrap'` | `'loop'` | Row navigation wrapping |
| `colWrap` | `'continuous' \| 'loop' \| 'nowrap'` | `'loop'` | Column navigation wrapping |
| `multi` | `boolean` | `false` | Multiple cell selection |
| `selectionMode` | `'follow' \| 'explicit'` | `'follow'` | Select on focus vs action |
| `enableRangeSelection` | `boolean` | `false` | Range selection with modifiers |

**GridRow** — `rowIndex: number` (auto).
**GridCell** — `id`, `role` (`'gridcell'`), `disabled` (`false`), `selected` (two-way), `selectable` (`true`), `rowSpan`, `colSpan`, `rowIndex`, `colIndex`, `orientation` (`'horizontal'`), `wrap` (`true`).
**GridCellWidget** — `id`, `widgetType: 'simple' \| 'complex' \| 'editable'` (`'simple'`), `disabled` (`false`), `focusTarget`. Methods: `activate()`, `deactivate()`. Events: `activated`, `deactivated`.

## Keyboard

- **Arrow keys** — navigate cells (up/down/left/right; flips for RTL).
- **Home / End** — row/column start/end.
- **Page Up / Down** — larger vertical jumps.
- **Space / Enter** — activate or select the focused cell.

## Example

```ts
import { Component } from '@angular/core';
import { Grid, GridRow, GridCell, GridCellWidget } from '@angular/aria/grid';

@Component({
  selector: 'app-grid-demo',
  templateUrl: 'grid-demo.html',
  imports: [Grid, GridRow, GridCell, GridCellWidget],
})
export class GridDemoComponent {
  data = [
    ['A1', 'B1'],
    ['A2', 'B2'],
  ];
}
```

```html
<table ngGrid>
  <tr ngGridRow>
    <td ngGridCell>Header 1</td>
    <td ngGridCell>Header 2</td>
  </tr>
  @for (row of data; track row) {
    <tr ngGridRow>
      @for (cell of row; track cell) {
        <td ngGridCell>
          <button ngGridCellWidget>{{ cell }}</button>
        </td>
      }
    </tr>
  }
</table>
```

Source: https://angular.dev/guide/aria/grid
