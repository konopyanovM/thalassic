---
name: angular-aria
description: Build accessible UI with @angular/aria headless directives (listbox, combobox, menu, tabs, accordion, grid, tree, select, toolbar, etc). Use when adding keyboard navigation, ARIA roles, focus management, or roving-tabindex behavior to a component, or when implementing any WAI-ARIA widget pattern in this Angular app.
---

# Angular Aria (`@angular/aria`)

`@angular/aria` is Angular's collection of **headless, accessible directives** implementing common WAI-ARIA patterns. Each primitive handles keyboard interaction, ARIA attribute binding, focus management, and screen-reader support. You supply the **HTML structure, CSS, and business logic**; the directive owns accessibility.

This repo runs **Angular 21.2.1**. The package is a separate install:

```
npm install @angular/aria
```

## When to use this skill

- Implementing any of the WAI-ARIA widget patterns below (a select, menu, tabs, tree, autocomplete…).
- Adding keyboard navigation, roving tabindex / `aria-activedescendant`, or type-ahead to a list of items.
- Reviewing or authoring a `tls-*` component in `libs/ui` that needs focus management or composite-widget ARIA.

Before building keyboard/focus logic by hand (`ListKeyManager`, `ActiveDescendantKeyManager`, manual `role`/`aria-selected` bindings), check whether an `@angular/aria` primitive already covers the pattern.

## Available primitives

Each has a dedicated reference under `reference/`. Read the relevant one before implementing.

| Category | Primitives |
|---|---|
| Search & selection | Autocomplete, **Listbox**, Select, Multiselect, Combobox |
| Navigation | Menu, Menubar, Toolbar |
| Content organization | Accordion, Tabs, Tree, Grid |

Reference files (read the relevant one before implementing):

| Component | File | Directives |
|---|---|---|
| Listbox | `reference/listbox.md` | `ngListbox`, `ngOption` |
| Combobox | `reference/combobox.md` | `ngCombobox`, `ngComboboxPopup`, `ngComboboxWidget` |
| Autocomplete | `reference/autocomplete.md` | combobox + listbox (editable) |
| Select | `reference/select.md` | combobox + listbox (single) |
| Multiselect | `reference/multiselect.md` | combobox + listbox (`multi`) |
| Menu | `reference/menu.md` | `ngMenu`, `ngMenuTrigger`, `ngMenuContent`, `ngMenuItem` |
| Menubar | `reference/menubar.md` | `ngMenuBar` (in `@angular/aria/menu`) |
| Toolbar | `reference/toolbar.md` | `ngToolbar`, `ngToolbarWidget`, `ngToolbarWidgetGroup` |
| Accordion | `reference/accordion.md` | `ngAccordionGroup`, `ngAccordionTrigger`, `ngAccordionPanel`, `ngAccordionContent` |
| Tabs | `reference/tabs.md` | `ngTabs`, `ngTabList`, `ngTab`, `ngTabPanel`, `ngTabContent` |
| Tree | `reference/tree.md` | `ngTree`, `ngTreeItem`, `ngTreeItemGroup` |
| Grid | `reference/grid.md` | `ngGrid`, `ngGridRow`, `ngGridCell`, `ngGridCellWidget` |

**Autocomplete, Select, and Multiselect are not standalone packages** — they are compositions of `Combobox` + `Listbox`. Read `combobox.md` and `listbox.md` alongside them.

(Add a `reference/<name>.md` per new component in the same format; keep each one's detail out of this file.)

## Shape of these directives

- **Attribute-selector directives on native elements** (`ngListbox`, `ngOption`, …). They emit the ARIA (`role`, `aria-selected`, `aria-activedescendant`, etc.) natively, so — per this repo's conventions — attributes apply directly and you do **not** wrap-and-forward. Prefer this directive shape over a wrapper component when no wrapper is required.
- **Headless**: no styles ship with them. Style via classes on your own elements (never tag selectors), using the `--spacing-*` and theme tokens like any other component here.
- **Composite-widget naming**: put the accessible name on the container role (`aria-labelledby` / `aria-label`), not duplicated onto each inner item — the primitives already assign per-item roles.

## RTL

The app is direction-aware (`DirectionService` → `<html dir>`, bridged into CDK `Directionality`). Arrow-key direction is one of the two things logical CSS can't express, so horizontal widgets (`orientation: 'horizontal'`) must resolve Left/Right correctly for RTL. `@angular/aria` resolves keyboard direction through CDK `Directionality`, so it flips on its own — verify rather than hand-coding an override.
