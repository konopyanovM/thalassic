import { Menu as AriaMenu, MenuItem as AriaMenuItem } from '@angular/aria/menu';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
} from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  isDevMode,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Point } from '@thalassic/core';
import { createOverlayManager } from '../../abstract/overlay';
import { overlayPosition } from '../../types';
import { buildOverlayPositions } from '../../utils';
import { Icon } from '../icon';
import { Kbd } from '../kbd';
import { MenuItemComponent } from './menu-item';
import { MENU_CONFIG } from './menu.token';
import { MenuActionItem, MenuItemDefinition, MenuRenderBlock, MenuRenderGroup } from './menu.types';

@Component({
  selector: 'tls-menu',
  imports: [NgTemplateOutlet, Icon, Kbd, RouterLink, AriaMenu, AriaMenuItem],
  templateUrl: './menu.html',
  host: {
    // Unless the menu is inline, nothing renders in place — the panel lives in
    // an overlay — so the host leaves the flow rather than claiming a slot (and
    // a flex/grid gap) as an invisible empty box.
    '[style.display]': "inline() ? null : 'none'",
  },
})
export class Menu {
  private static _counter = 0;

  private readonly _config = inject(MENU_CONFIG);
  private readonly _overlay = createOverlayManager();

  private readonly _panelRef = viewChild.required<TemplateRef<unknown>>('panel');

  protected readonly _customItems = contentChildren(MenuItemComponent);
  protected readonly customTemplates = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const item of this._customItems()) {
      map.set(item.key(), item.templateRef());
    }
    return map;
  });

  /** Content of every action item, rendered inside the menu-managed interactive wrapper. */
  protected readonly itemTemplate = contentChild<TemplateRef<unknown>>('itemTemplate');
  protected readonly labelTemplate = contentChild<TemplateRef<unknown>>('labelTemplate');
  protected readonly dividerTemplate = contentChild<TemplateRef<unknown>>('dividerTemplate');
  protected readonly iconTemplate = contentChild<TemplateRef<unknown>>('iconTemplate');

  public readonly id = `tls-menu-${++Menu._counter}`;

  // Inputs
  public readonly items: InputSignal<MenuItemDefinition[]> = input<MenuItemDefinition[]>([]);
  public readonly position: InputSignal<overlayPosition> = input<overlayPosition>(
    this._config.position,
  );
  public readonly offset: InputSignal<Point> = input<Point>(this._config.offset);
  public readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public readonly inline: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  private readonly _positions = computed<ConnectedPosition[]>(() =>
    buildOverlayPositions(this.position(), this.offset()),
  );

  // A `label` item opens a section that runs until the next label or divider;
  // its items render inside a `role="group"` container named after the label.
  protected readonly blocks = computed<MenuRenderBlock[]>(() => {
    const blocks: MenuRenderBlock[] = [];
    let group: MenuRenderGroup | null = null;

    this.items().forEach((item, index) => {
      if (item.type === 'label') {
        group = { kind: 'group', label: item, entries: [] };
        blocks.push(group);
        return;
      }
      if (item.type === 'divider') {
        group = null;
        blocks.push({ kind: 'single', entry: { item, index } });
        return;
      }
      if (group) {
        group.entries.push({ item, index });
      } else {
        blocks.push({ kind: 'single', entry: { item, index } });
      }
    });

    return blocks;
  });

  // An inline menu is always "open" (rendered in place); otherwise reflect the overlay.
  public readonly isOpen = computed(() => this.inline() || this._overlay.isOpen());

  constructor() {
    if (isDevMode()) {
      effect(() => {
        const templates = this.customTemplates();
        for (const item of this.items()) {
          if (item.type === 'custom' && !templates.has(item.key)) {
            console.warn(
              `[tls-menu] No <tls-menu-item key="${item.key}"> found for custom item. The slot will be skipped.`,
            );
          }
          if (item.type === 'item' && item.templateKey && !templates.has(item.templateKey)) {
            console.warn(
              `[tls-menu] No <tls-menu-item key="${item.templateKey}"> found for item "${item.label}". Its default content is rendered instead.`,
            );
          }
        }
      });
    }
  }

  // Public methods
  public open(trigger: MouseEvent | HTMLElement): void {
    if (this.inline()) return;

    const origin: FlexibleConnectedPositionStrategyOrigin =
      trigger instanceof MouseEvent ? (trigger.currentTarget as HTMLElement) : trigger;

    this._overlay.open({
      content: this._panelRef(),
      origin,
      positions: this._positions(),
    });
  }

  public openAtPoint(x: number, y: number): void {
    if (this.inline()) return;

    this._overlay.open({
      content: this._panelRef(),
      origin: { x, y },
      positions: this._positions(),
      scrollStrategy: 'close',
      hasBackdrop: false,
      ignoreTrailingAuxClick: true,
    });
  }

  public close(): void {
    this._overlay.close();
  }

  public toggle(trigger: MouseEvent | HTMLElement): void {
    if (this._overlay.isOpen()) {
      this.close();
    } else {
      this.open(trigger);
    }
  }

  // Protected
  protected onItemClick(item: MenuActionItem): void {
    item.action?.();
    if (item.closeOnSelect ?? true) this.close();
  }

  /** Whether the item carries a checked state (`menuitemradio` / `menuitemcheckbox`). */
  protected isCheckable(item: MenuActionItem): boolean {
    return item.role === 'menuitemradio' || item.role === 'menuitemcheckbox';
  }

  /** Id of the item's label element, referenced by `aria-labelledby`. */
  protected itemLabelId(index: number): string {
    return `${this.id}-item-${index}-label`;
  }

  /** Id of the item's description element, referenced by `aria-describedby`. */
  protected itemDescriptionId(index: number): string {
    return `${this.id}-item-${index}-description`;
  }

  /** Content template for the item: its keyed slot first, the shared `#itemTemplate` otherwise. */
  protected itemContentTemplate(item: MenuActionItem): TemplateRef<unknown> | undefined {
    if (item.templateKey) {
      const template = this.customTemplates().get(item.templateKey);
      if (template) return template;
    }
    return this.itemTemplate();
  }
}
