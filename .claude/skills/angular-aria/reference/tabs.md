# Tabs — `@angular/aria/tabs`

Accessible tab interface: `role="tablist"` / `role="tab"` / `role="tabpanel"`, roving focus, and optional lazy panel rendering.

## Directives

Import from `@angular/aria/tabs`:

- **`Tabs`** — `[ngTabs]`. Root container coordinating tabs and panels.
- **`TabList`** — `[ngTabList]`. Container managing the tab buttons and navigation.
- **`Tab`** — `[ngTab]`. A tab button.
- **`TabPanel`** — `[ngTabPanel]`. Content panel for a tab.
- **`TabContent`** — `[ngTabContent]`. Structural directive for lazy panel rendering (renders on first activation).

## Inputs

**TabList**

| Input | Type | Default | Purpose |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout / arrow-key axis |
| `wrap` | `boolean` | `true` | Navigation wraps at ends |
| `softDisabled` | `boolean` | `true` | Disabled tabs focusable but not activatable |
| `selectionMode` | `'follow' \| 'explicit'` | `'follow'` | Activate on focus vs require Space/Enter |
| `focusMode` | `'roving' \| 'activedescendant'` | `'roving'` | Focus strategy |
| `selectedTab` | `any` | — | Selected tab value (two-way bindable) |

**Tab** — `value: any` (**required**, unique id), `disabled: boolean` (`false`).
**TabPanel** — `value: any` (**required**, matches its tab), `preserveContent: boolean` (`true`).

## Keyboard

- **Horizontal** — Arrow Left/Right, Home, End.
- **Vertical** — Arrow Up/Down, Home, End.
- **Space / Enter** — activate (explicit mode).
- `selectionMode="follow"` activates on focus; `"explicit"` requires manual activation.

## Example

```ts
import { Component } from '@angular/core';
import { Tab, Tabs, TabList, TabPanel, TabContent } from '@angular/aria/tabs';

@Component({
  selector: 'app-tabs',
  imports: [Tabs, TabList, Tab, TabPanel, TabContent],
  template: `
    <div ngTabs>
      <div ngTabList selectionMode="follow" selectedTab="tab1">
        <div ngTab value="tab1">Tab 1</div>
        <div ngTab value="tab2">Tab 2</div>
      </div>
      <div ngTabPanel value="tab1">
        <ng-template ngTabContent>Content 1</ng-template>
      </div>
      <div ngTabPanel value="tab2">
        <ng-template ngTabContent>Content 2</ng-template>
      </div>
    </div>
  `,
})
export class AppTabs {}
```

Horizontal arrow-key direction flips for RTL via CDK `Directionality`. This repo already has a `tls`-tabs feature (`libs/ui/src/features/tabs`).

Source: https://angular.dev/guide/aria/tabs
