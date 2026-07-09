# Accordion — `@angular/aria/accordion`

Accessible expandable/collapsible sections with keyboard navigation and `aria-expanded` / `aria-controls` wiring.

## Directives

Import from `@angular/aria/accordion`:

- **`AccordionGroup`** — `[ngAccordionGroup]`. Container coordinating the panels.
- **`AccordionTrigger`** — `[ngAccordionTrigger]`. The header/button that toggles a panel.
- **`AccordionPanel`** — `[ngAccordionPanel]`. The collapsible region.
- **`AccordionContent`** — `[ngAccordionContent]`. Structural directive (`ng-template`) for the panel body; enables deferred rendering.

## Inputs

**AccordionGroup**

| Input | Type | Default | Purpose |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Disable all triggers |
| `multiExpandable` | `boolean` | `true` | Allow multiple panels open at once |
| `softDisabled` | `boolean` | `true` | Disabled items stay focusable (`true`) vs skipped (`false`) |
| `wrap` | `boolean` | `false` | Keyboard navigation wraps at the ends |

**AccordionTrigger**

| Input | Type | Default | Purpose |
|---|---|---|---|
| `panel` | `AccordionPanel` | — | **Required.** Associated panel |
| `id` | `string` | auto | Trigger id |
| `disabled` | `boolean` | `false` | Disable this trigger |
| `expanded` | `boolean` | `false` | Expansion state (two-way bindable) |

Exposes `active(): Signal<boolean>` (focus state).

**AccordionPanel**

| Input | Type | Default | Purpose |
|---|---|---|---|
| `id` | `string` | auto | Panel id |
| `preserveContent` | `boolean` | `true` | Keep content in DOM after collapse |

Exposes `visible(): Signal<boolean>`.

## Keyboard

- **Arrow Down / Up** — move between triggers.
- **Home / End** — first / last trigger.
- **Enter / Space** — toggle the associated panel.

## Example

```ts
import { Component } from '@angular/core';
import {
  AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent,
} from '@angular/aria/accordion';

@Component({
  selector: 'app-accordion-demo',
  templateUrl: './accordion.html',
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
})
export class AccordionDemoComponent {}
```

```html
<div ngAccordionGroup [multiExpandable]="false">
  <h3>
    <span ngAccordionTrigger [panel]="panelOne" #triggerOne="ngAccordionTrigger">
      Question One
    </span>
  </h3>
  <div ngAccordionPanel #panelOne="ngAccordionPanel">
    <ng-template ngAccordionContent>
      <p>Answer to question one.</p>
    </ng-template>
  </div>
</div>
```

Source: https://angular.dev/guide/aria/accordion
