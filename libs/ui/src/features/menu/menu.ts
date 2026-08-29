import { Menu as AriaMenu, MenuItem as AriaMenuItem } from '@angular/aria/menu';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
} from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  Injector,
  input,
  InputSignal,
  InputSignalWithTransform,
  isDevMode,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  DEFAULT_PAN_CONFIG,
  DRAG_DISMISS_POINTER_TYPES,
  DRAG_DISMISS_RATIO,
  PAN_CONFIG,
  PanDirective,
  PanEvent,
  Point,
  SWIPE_DEFAULT_MIN_VELOCITY,
  ViewportService,
} from '@thalassic/core';
import { createOverlayManager, LEAVE_ANIMATION_FALLBACK_MS } from '../../abstract/overlay';
import { overlayPosition } from '../../types';
import { buildOverlayPositions } from '../../utils';
import { Icon } from '../icon';
import { Kbd } from '../kbd';
import { MenuItemComponent } from './menu-item';
import { MENU_CONFIG } from './menu.token';
import { MenuActionItem, MenuItemDefinition, MenuRenderBlock, MenuRenderGroup } from './menu.types';

@Component({
  selector: 'tls-menu',
  imports: [NgTemplateOutlet, Icon, Kbd, RouterLink, AriaMenu, AriaMenuItem, PanDirective],
  providers: [
    // The sheet's dismissal drag runs down the vertical axis only, from the
    // pointers that drag panels shut anywhere else; whether the gesture is
    // live at all is driven per open through the pane's `tlsPan` binding, so
    // the config's own flag stays off.
    {
      provide: PAN_CONFIG,
      useValue: {
        ...DEFAULT_PAN_CONFIG,
        axis: 'y',
        enabled: false,
        pointerTypes: DRAG_DISMISS_POINTER_TYPES,
      },
    },
  ],
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
  // Optional: only apps that call `provideViewport()` register it, and without
  // it the `sheetBelow` behaviour simply stays off.
  private readonly _viewportService = inject(ViewportService, {
    optional: true,
  });

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

  // Whether the current open presents as a bottom sheet. Captured per open —
  // not derived live — so a viewport resize mid-open cannot restyle a pane the
  // overlay has already placed the other way.
  protected readonly sheet = signal(false);

  // The sheet's dismissal drag. `dragging` while the finger holds the pane,
  // `settling` while it animates to its released destination — open again, or
  // out past the bottom edge.
  protected readonly sheetDragState = signal<'idle' | 'dragging' | 'settling'>('idle');

  private readonly _injector = inject(Injector);
  private _sheetClosing = false;
  // Pane height sampled once per gesture: the pane is sized by its content, so
  // only the rendered box is authoritative.
  private _sheetDragExtent = 0;

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
    const sheet = this._prefersSheet();
    this._prepareOpen(sheet);

    this._overlay.open({
      content: this._panelRef(),
      origin,
      positions: this._positions(),
      ...(sheet && { presentation: 'sheet' as const }),
    });
  }

  public openAtPoint(x: number, y: number): void {
    if (this.inline()) return;

    const sheet = this._prefersSheet();
    this._prepareOpen(sheet);

    // A sheet keeps the modal dismissal a sheet implies (backdrop, blocked
    // scroll) even when opened from a point: the point only ever chose where
    // an anchored panel would sit, and a sheet sits nowhere but the bottom.
    this._overlay.open({
      content: this._panelRef(),
      origin: { x, y },
      positions: this._positions(),
      ...(sheet
        ? { presentation: 'sheet' as const }
        : { scrollStrategy: 'close' as const, hasBackdrop: false }),
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

  protected onSheetPanStart(pane: HTMLElement): void {
    if (this._sheetClosing) return;

    this._sheetDragExtent = pane.getBoundingClientRect().height;
    this.sheetDragState.set('dragging');
  }

  // Fired outside the Angular zone (see `PanDirective.panMove`), so it writes
  // to the DOM directly and never touches a signal.
  protected onSheetPanMove(event: PanEvent, pane: HTMLElement): void {
    if (this._sheetClosing) return;
    this._applySheetDrag(pane, Math.max(0, event.deltaY));
  }

  protected onSheetPanEnd(event: PanEvent, pane: HTMLElement): void {
    if (this._sheetClosing) return;

    // Either condition commits: a short flick is as clear an intent to dismiss
    // as a slow drag past the ratio, and requiring both would strand each on
    // its own.
    const travelled =
      this._sheetDragExtent > 0 &&
      Math.max(0, event.deltaY) / this._sheetDragExtent >= DRAG_DISMISS_RATIO;
    const flicked = event.velocityY >= SWIPE_DEFAULT_MIN_VELOCITY;

    if (travelled || flicked) {
      this._sheetDragClose(pane);
      return;
    }

    this._settleSheet(pane, 0, () => this.sheetDragState.set('idle'));
  }

  protected onSheetPanCancel(pane: HTMLElement): void {
    if (this._sheetClosing) return;
    this._settleSheet(pane, 0, () => this.sheetDragState.set('idle'));
  }

  // Private methods
  /** Whether the viewport sits at or below the configured sheet breakpoint. */
  private _prefersSheet(): boolean {
    const sheetBelow = this._config.sheetBelow;
    if (!sheetBelow || !this._viewportService) return false;

    return this._viewportService.isBelow(sheetBelow)();
  }

  // Resets the per-open presentation state; the pane itself is stamped fresh
  // from the template on every open, so only the component-held state carries
  // over.
  private _prepareOpen(sheet: boolean): void {
    this.sheet.set(sheet);
    this.sheetDragState.set('idle');
    this._sheetClosing = false;
  }

  private _applySheetDrag(pane: HTMLElement, offset: number): void {
    pane.style.setProperty('--tls-menu-drag', `${offset}px`);

    // The scrim thins as the sheet travels out, tracking the finger.
    const backdrop = this._overlay.backdropElement;
    if (backdrop === null) return;

    const progress = this._sheetDragExtent > 0 ? Math.min(1, offset / this._sheetDragExtent) : 0;
    backdrop.style.opacity = `${1 - progress}`;
  }

  // Continues the drag out past the bottom edge and closes on arrival. A
  // dismissal that began as a drag must not route through the leave keyframe:
  // that starts from the fully open position, so the pane would snap back for
  // a frame before leaving — the stylesheet stands the keyframe down while
  // the drag state classes are on.
  private _sheetDragClose(pane: HTMLElement): void {
    this._sheetClosing = true;
    this._settleSheet(pane, this._sheetDragExtent, () => this._overlay.close());
  }

  private _settleSheet(pane: HTMLElement, target: number, onDone: () => void): void {
    this.sheetDragState.set('settling');

    // The settle transition lives on the settling class, so the target value
    // must not be written until change detection has put that class on the
    // pane — set in the same frame, the property would jump instead of
    // animating.
    afterNextRender(
      () => {
        this._applySheetDrag(pane, target);
        this._afterSheetSettle(pane, onDone);
      },
      { injector: this._injector },
    );
  }

  // Runs `onDone` once the settle transition finishes, or at once when no
  // transition is emitted (the `none` motion level), so a sheet dismissed by
  // drag still closes when the user has asked for no motion.
  private _afterSheetSettle(pane: HTMLElement, onDone: () => void): void {
    // `transitionDuration` is a comma-separated list, and is absent entirely
    // where the engine reports no transition at all, so the test is whether
    // any entry actually lasts — not equality against a single `0s`.
    const runs = getComputedStyle(pane)
      .transitionDuration.split(',')
      .some(duration => parseFloat(duration) > 0);
    if (!runs) {
      onDone();
      return;
    }

    let settled = false;
    const finalize = (): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      pane.removeEventListener('transitionend', onTransitionEnd);
      onDone();
    };

    // Only the pane's own transform settles it; ignore `transitionend`
    // bubbling up from animated content inside it.
    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.target === pane && event.propertyName === 'transform') finalize();
    };

    pane.addEventListener('transitionend', onTransitionEnd);
    // Safety net if `transitionend` never arrives (e.g. the pane is torn down early).
    const timeoutId = window.setTimeout(finalize, LEAVE_ANIMATION_FALLBACK_MS);
  }
}
