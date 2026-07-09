# Tree — `@angular/aria/tree`

Accessible hierarchical tree with expand/collapse, selection, and keyboard navigation (`role="tree"` / `role="treeitem"` / `role="group"`).

## Directives

Import from `@angular/aria/tree`:

- **`Tree`** — `[ngTree]`. The root container.
- **`TreeItem`** — `[ngTreeItem]`. A node.
- **`TreeItemGroup`** — `[ngTreeItemGroup]`. Structural directive wrapping a node's children.

## Inputs

**Tree**

| Input | Type | Default | Purpose |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Disable the tree |
| `softDisabled` | `boolean` | `true` | Disabled items stay focusable |
| `multi` | `boolean` | `false` | Multiple selection |
| `selectionMode` | `'explicit' \| 'follow'` | `'explicit'` | Select on action vs on focus |
| `nav` | `boolean` | `false` | Navigation mode using `aria-current` |
| `wrap` | `boolean` | `true` | Navigation wraps |
| `focusMode` | `'roving' \| 'activedescendant'` | `'roving'` | Focus strategy |
| `value` | `any[]` | `[]` | Selected values (two-way bindable) |

**TreeItem** — `parent: Tree \| TreeItemGroup` (**required**), `value: any` (**required**), `disabled: boolean` (`false`), `expanded: boolean` (`false`, two-way bindable).
**TreeItemGroup** — `ownedBy: TreeItem` (**required**, the parent item).

## Keyboard

- **Arrow Up / Down** — navigate items.
- **Arrow Right** — expand / move to first child.
- **Arrow Left** — collapse / move to parent.
- **Home / End** — first / last item.
- **Space** — select focused item.
- **Type-ahead** — search by first letter.

## Example

```ts
import { Component, signal } from '@angular/core';
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { NgTemplateOutlet } from '@angular/common';

type node = {
  name: string;
  value: string;
  children?: node[];
  expanded?: boolean;
};

@Component({
  selector: 'app-tree',
  templateUrl: './tree.html',
  imports: [Tree, TreeItem, TreeItemGroup, NgTemplateOutlet],
})
export class TreeComponent {
  nodes: node[] = [
    { name: 'Folder A', value: 'a', children: [{ name: 'File A1', value: 'a1' }] },
    { name: 'File B', value: 'b' },
  ];
  selected = signal(['b']);
}
```

```html
<ul ngTree #tree="ngTree" [(value)]="selected">
  <ng-template [ngTemplateOutlet]="treeNodes" [ngTemplateOutletContext]="{ nodes, parent: tree }" />
</ul>

<ng-template #treeNodes let-nodes="nodes" let-parent="parent">
  @for (node of nodes; track node.value) {
    <li ngTreeItem [parent]="parent" [value]="node.value" [label]="node.name"
        [(expanded)]="node.expanded" #item="ngTreeItem">
      {{ node.name }}
    </li>

    @if (node.children) {
      <ul role="group">
        <ng-template ngTreeItemGroup [ownedBy]="item" #group="ngTreeItemGroup">
          <ng-template [ngTemplateOutlet]="treeNodes"
                       [ngTemplateOutletContext]="{ nodes: node.children, parent: group }" />
        </ng-template>
      </ul>
    }
  }
</ng-template>
```

Source: https://angular.dev/guide/aria/tree
