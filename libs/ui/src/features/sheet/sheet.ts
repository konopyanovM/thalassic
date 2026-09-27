import { ConfigurableFocusTrapFactory, FocusTrap, InputModalityDetector } from '@angular/cdk/a11y';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Overlay, OverlayContainer, OverlayRef } from '@angular/cdk/overlay';
import { DomPortal } from '@angular/cdk/portal';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  OnDestroy,
  Renderer2,
  RendererStyleFlags2,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DRAG_DISMISS_POINTER_TYPES, PanDirective, PanEvent } from '@thalassic/core';
import { whenAnimationsFinish } from '../../abstract/overlay';
import { resolveDetent, SheetMotion, SheetMotionSurface } from '../../abstract/sheet-motion';
import { resolveDetentHeight } from './resolve-detent-height';
import { SheetHeaderDirective } from './sheet-header.directive';
import {
  SHEET_COLLAPSED_SIZE_PROPERTY,
  SHEET_HEIGHT_PROPERTY,
  SHEET_OFFSET_PROPERTY,
  SHEET_OVERSHOOT_DIVISOR,
  SHEET_OVERSHOOT_MAX,
  SHEET_PANE_CLASS,
} from './sheet.constants';
import { SheetDetent, sheetFocusRestoreTarget } from './sheet.types';

/**
 * A persistent bottom sheet: one surface, at rest at one of several named
 * heights (detents), that a page declares in its template and keeps for as
 * long as the component lives. It grows and shrinks between detents by drag,
 * by its header button, by arrow keys, or by `snapTo`; at or above
 * `modalFrom` it is a modal dialog, below it the page stays interactive.
 *
 * The host stays in the page, so the page's injector and `@if` own the
 * sheet, while its panel is rendered in a CDK overlay pane at the end of
 * `body` — page hosts may sit under transforms that would turn a fixed panel
 * into an absolute one. One sheet at a time: it publishes the collapsed height
 * as `--tls-sheet-collapsed-size` on the root element for the page to reserve.
 *
 * Transient, code-summoned surfaces are `tls-drawer`'s; nothing here dismisses.
 */
@Component({
  selector: 'tls-sheet',
  exportAs: 'tlsSheet',
  imports: [NgTemplateOutlet, PanDirective],
  templateUrl: './sheet.html',
  host: {
    // Nothing renders in place — the panel lives in the overlay — so the host
    // claims no slot in the page's flow.
    style: 'display: none',
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class Sheet implements OnDestroy {
  // Injections
  private readonly _overlay = inject(Overlay);
  private readonly _renderer = inject(Renderer2);
  private readonly _injector = inject(Injector);
  private readonly _document = inject(DOCUMENT);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _viewportRuler = inject(ViewportRuler);
  private readonly _focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  private readonly _overlayContainer = inject(OverlayContainer);
  private readonly _inputModalityDetector = inject(InputModalityDetector);

  // Inputs
  /** Resting heights, smallest to largest. */
  public readonly detents: InputSignal<SheetDetent[]> = input.required<SheetDetent[]>();
  /**
   * The resting detent's id. Written on arrival at a detent; setting it moves
   * there. An id no detent carries, the empty default included, moves the sheet
   * to the first detent and is rewritten to that detent's id.
   */
  public readonly detent: ModelSignal<string> = model<string>('');
  /** Detent id at or above which the sheet is modal; `null` never. */
  public readonly modalFrom: InputSignal<string | null> = input<string | null>(null);
  /** Accessible name of the region or dialog. */
  public readonly label: InputSignal<string> = input.required<string>();
  /** Localized names per detent id, announced with the label; an id without one is announced as is. */
  public readonly detentLabels: InputSignal<Record<string, string>> = input<Record<string, string>>(
    {},
  );
  /** Whether the pill along the top edge that advertises the drag is drawn. */
  public readonly grabber: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  // State
  // Numbers the instances, so each sheet's ids are unique in the document;
  // declared first because `id` reads it.
  private static _counter = 0;
  public readonly id = `tls-sheet-${++Sheet._counter}`;
  protected readonly bodyId = `${this.id}-body`;
  protected readonly headerTemplate = contentChild.required(SheetHeaderDirective);
  protected readonly pointerTypes = DRAG_DISMISS_POINTER_TYPES;
  private readonly _root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly _backdrop = viewChild.required<ElementRef<HTMLElement>>('backdrop');
  private readonly _panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly _header = viewChild.required<ElementRef<HTMLElement>>('header');
  // The scroll container: its `scrollTop` decides whether a pan at the top
  // detent is the sheet's or the body's. The content inside it is what is measured.
  private readonly _body = viewChild.required<ElementRef<HTMLElement>>('body');
  private readonly _content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly _probe = viewChild.required<ElementRef<HTMLElement>>('probe');
  // Height in px of each detent, in `detents` order; empty until measured.
  private readonly _heights = signal<readonly number[]>([]);
  // Annotated because its own callback reads it back for the travel.
  private readonly _motion: SheetMotion = new SheetMotion({
    property: SHEET_OFFSET_PROPERTY,
    backdropOpacity: progress => this._backdropOpacityAt(progress * this._motion.extent),
    renderer: this._renderer,
    injector: this._injector,
  });
  protected readonly motionState = this._motion.state;
  private _overlayRef: OverlayRef | null = null;
  // The detent the sheet is at or moving to, so a remeasure mid-settle
  // re-targets the settle rather than snapping back to where it started.
  private _targetIndex = 0;
  // The detent a drag began at, for the release decision.
  private _dragStartIndex = 0;
  // A pan the body's own scrolling owns; its moves and end are not the sheet's.
  private _declined = false;
  private _focusTrap: FocusTrap | null = null;
  // Page-level elements made inert while modal, to be released as found.
  private _inerted: Element[] = [];
  // What had focus in the page before the sheet went modal, for a destroy
  // that removes the header focus would otherwise return to.
  private _focusBeforeModal: HTMLElement | null = null;

  // Computed
  protected readonly currentIndex = computed(() => {
    const index = this.detents().findIndex(candidate => candidate.id === this.detent());
    return index === -1 ? 0 : index;
  });
  protected readonly isTop = computed(() => this.currentIndex() === this.detents().length - 1);
  protected readonly isExpanded = computed(() => this.currentIndex() > 0);
  protected readonly isModal = computed(() => {
    const from = this.modalFrom();
    if (from === null) return false;
    const fromIndex = this.detents().findIndex(candidate => candidate.id === from);
    return fromIndex !== -1 && this.currentIndex() >= fromIndex;
  });
  protected readonly description = computed(() => {
    const current = this.detents()[this.currentIndex()];
    if (current === undefined) return this.label();
    const labels = this.detentLabels();
    const name = current.id in labels ? labels[current.id] : current.id;
    return `${this.label()}: ${name}`;
  });

  constructor() {
    afterNextRender(() => {
      this._attach();
      this._measure();
      this._place(this.currentIndex());
      this._applyModality(this.isModal(), 'header');
    });

    // A detent the page sets moves the sheet. One naming where the sheet is or
    // is heading — an arrival's own write among them — is already honoured. An
    // id no detent carries moves the sheet to the first detent, whose arrival
    // rewrites the model to that detent's id.
    effect(() => {
      const id = this.detent();
      untracked(() => {
        const index = this.detents().findIndex(candidate => candidate.id === id);
        const target = index === -1 ? 0 : index;
        if (this._overlayRef === null || target === this._targetIndex) return;
        this._settleTo(target);
      });
    });

    // Modality follows the resting detent: it flips on arrival for every
    // user-driven move, and at the write when the page sets `detent` — never
    // mid-drag.
    effect(() => {
      const modal = this.isModal();
      untracked(() => {
        if (this._overlayRef !== null) this._applyModality(modal, 'header');
      });
    });

    // Re-places the sheet when the detent list or the modal threshold changes:
    // new detents resolve to new heights, and a new threshold moves where the
    // scrim is opaque.
    effect(() => {
      this.detents();
      this.modalFrom();
      untracked(() => this.remeasure());
    });

    this._viewportRuler
      .change(100)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.remeasure());
  }

  // Public methods
  /** Moves to the detent with `id`; an unknown id is ignored. */
  public snapTo(id: string): void {
    const index = this.detents().findIndex(candidate => candidate.id === id);
    if (index === -1 || this._overlayRef === null) return;
    this._settleTo(index);
  }

  /** Moves one detent up; a no-op at the largest. */
  public expand(): void {
    if (this._overlayRef === null) return;
    // From where the sheet is heading, so a step during a settle goes on past it.
    const next = this._targetIndex + 1;
    if (next < this.detents().length) this._settleTo(next);
  }

  /** Moves one detent down; a no-op at the smallest. */
  public collapse(): void {
    if (this._overlayRef === null) return;
    const previous = this._targetIndex - 1;
    if (previous >= 0) this._settleTo(previous);
  }

  /**
   * Re-reads the detent heights and brings the sheet to its detent at the new
   * heights. Runs by itself when the viewport, the header or the content
   * changes size; public for a page whose detents depend on anything else.
   */
  public remeasure(): void {
    if (this._overlayRef === null) return;
    this._measure();
    // A shorter detent list leaves no detent at an old index past its end, so
    // the target and a drag's start fall back to the largest that remains.
    const last = this.detents().length - 1;
    this._targetIndex = Math.min(this._targetIndex, last);
    this._dragStartIndex = Math.min(this._dragStartIndex, last);
    // At rest the sheet is re-placed at once; a settle in flight is re-aimed
    // at its target's new offset; a drag reads the heights live and settles
    // against them on release.
    switch (this._motion.state()) {
      case 'idle':
        this._place(this.currentIndex());
        break;
      case 'settling':
        this._settleTo(this._targetIndex);
        break;
      case 'dragging':
        break;
    }
  }

  // Protected methods
  // The header steps down from a modal or the largest detent — where there is
  // nothing above to grow into — and up from any other.
  protected onHeaderClick(): void {
    if (this.isModal() || this.isTop()) {
      this.collapse();
      return;
    }
    this.expand();
  }

  // The arrows would otherwise scroll the page behind the sheet.
  protected onArrowUp(event: Event): void {
    event.preventDefault();
    this.expand();
  }

  protected onArrowDown(event: Event): void {
    event.preventDefault();
    this.collapse();
  }

  protected onPanStart(event: PanEvent): void {
    this._declined = !this._claims(event);
    if (this._declined) return;

    // At rest the target is the current detent; mid-settle it is where the
    // sheet was heading, so a grab during a move neither jumps back nor
    // resolves a flick from the detent being left.
    this._dragStartIndex = this._targetIndex;
    this._motion.begin(this._surface());
  }

  // Fired outside the Angular zone (see `PanDirective.panMove`), so it writes
  // to the DOM through the engine and writes no signal. The start height is
  // read live, so a remeasure mid-drag applies at once.
  protected onPanMove(event: PanEvent): void {
    if (this._declined || this._motion.state() !== 'dragging') return;
    const startHeight = this._heights()[this._dragStartIndex];
    this._motion.follow(this._offsetFor(startHeight - event.deltaY));
  }

  protected onPanEnd(event: PanEvent): void {
    if (this._declined || this._motion.state() !== 'dragging') return;

    const startHeight = this._heights()[this._dragStartIndex];
    const release = startHeight - event.deltaY;
    // Velocity is signed toward a larger height: upward travel is negative deltaY.
    const index = resolveDetent(this._heights(), this._dragStartIndex, release, -event.velocityY);
    this._settleFromDrag(index);
  }

  protected onPanCancel(): void {
    if (this._declined || this._motion.state() !== 'dragging') return;
    this._settleFromDrag(this._dragStartIndex);
  }

  // Heard at the document, so Escape works wherever focus sits while modal —
  // the backdrop and the panel's own surface take no focus. An Escape a
  // control already consumed, or one typed in another overlay (a drawer
  // stacked above the sheet), keeps the sheet where it is.
  protected onEscape(event: Event): void {
    if (!this.isModal() || event.defaultPrevented) return;
    const target = event.target;
    if (
      target instanceof Node &&
      this._overlayContainer.getContainerElement().contains(target) &&
      !this._root().nativeElement.contains(target)
    ) {
      return;
    }
    this._collapseBelowModal();
  }

  protected onBackdropClick(): void {
    if (this.isModal()) this._collapseBelowModal();
  }

  // Private methods
  // Moves the panel into a full-viewport pane at the end of body. The pane
  // passes pointers through; only the panel and the backdrop take them.
  private _attach(): void {
    const overlayRef = this._overlay.create({
      positionStrategy: this._overlay.position().global().top('0').left('0'),
      width: '100%',
      height: '100%',
      hasBackdrop: false,
      panelClass: SHEET_PANE_CLASS,
    });
    overlayRef.attach(new DomPortal(this._root().nativeElement));
    this._overlayRef = overlayRef;

    // The header's and the content's sizes are two of the measures the
    // detents resolve against; the viewport, the third, is the ruler's.
    const observer = new ResizeObserver(() => this.remeasure());
    observer.observe(this._header().nativeElement);
    observer.observe(this._content().nativeElement);
    this._destroyRef.onDestroy(() => observer.disconnect());
  }

  private _measure(): void {
    const header = this._header().nativeElement;
    // The content wrapper is unclipped, so its height is the body's natural one.
    const content = this._content().nativeElement;
    const probe = this._probe().nativeElement;
    const viewport = this._document.documentElement.clientHeight;
    const length = (css: string): number => {
      this._renderer.setStyle(probe, 'block-size', css);
      return probe.offsetHeight;
    };
    // The theme pads the header by the bottom safe-area inset, so its height
    // alone lets the lip clear a home indicator.
    const measures = {
      header: header.offsetHeight,
      content: header.offsetHeight + content.offsetHeight,
      viewport,
      length,
    };
    const heights = this.detents().map(candidate => resolveDetentHeight(candidate.size, measures));
    this._heights.set(heights);

    const largest = heights[heights.length - 1];
    this._renderer.setStyle(
      this._panel().nativeElement,
      SHEET_HEIGHT_PROPERTY,
      `${largest}px`,
      RendererStyleFlags2.DashCase,
    );
    // The published value is the lip's height: the first detent's.
    this._renderer.setStyle(
      this._document.documentElement,
      SHEET_COLLAPSED_SIZE_PROPERTY,
      `${heights[0]}px`,
      RendererStyleFlags2.DashCase,
    );
  }

  // Displacement below the largest detent that puts the panel at `index`.
  private _offsetOf(index: number): number {
    const heights = this._heights();
    return heights[heights.length - 1] - heights[index];
  }

  private _surface(): SheetMotionSurface {
    const heights = this._heights();
    return {
      panel: this._panel().nativeElement,
      backdrop: this._backdrop().nativeElement,
      extent: heights[heights.length - 1] - heights[0],
    };
  }

  // Puts the panel at `index` at once, with no motion: after measuring, the
  // sheet is already where it rests.
  private _place(index: number): void {
    this._targetIndex = index;
    const offset = this._offsetOf(index);
    this._renderer.setStyle(
      this._panel().nativeElement,
      SHEET_OFFSET_PROPERTY,
      `${offset}px`,
      RendererStyleFlags2.DashCase,
    );
    // The engine drives the scrim only while it moves; at rest it is set here.
    this._renderer.setStyle(
      this._backdrop().nativeElement,
      'opacity',
      `${this._backdropOpacityAt(offset)}`,
    );
    this._arrive(index);
  }

  // Animates the panel to `index` from wherever it is, by a settle from rest.
  private _settleTo(index: number): void {
    this._targetIndex = index;
    this._motion.moveTo(this._surface(), this._offsetOf(index), () => {
      this._motion.rest();
      this._arrive(index);
    });
  }

  // Whether a pan is the sheet's to move, or the body's to scroll. Only the
  // top detent scrolls the body; there a downward pan that starts inside the
  // body is the sheet's only when the body is already at its top. Decided
  // once, at the start — a hand-off mid-gesture is where jank lives.
  private _claims(event: PanEvent): boolean {
    if (!this.isTop()) return true;
    const body = this._body().nativeElement;
    const target = event.originalEvent.target;
    if (!(target instanceof Node) || !body.contains(target)) return true;
    // Within a pixel of the top counts as at it — the pan directive's own
    // reading — since fractional scrolling can leave the body a sub-pixel off.
    return body.scrollTop <= 1 && event.direction === 'down';
  }

  // Offset for a height the finger asks for. Above the largest detent the
  // panel holds (a lifted panel would show a gap beneath it); below the
  // smallest it follows a third of the overshoot, capped, so the end of the
  // travel reads as a stretch rather than a wall.
  private _offsetFor(height: number): number {
    const heights = this._heights();
    const smallest = heights[0];
    const largest = heights[heights.length - 1];
    if (height >= largest) return 0;
    if (height >= smallest) return largest - height;

    const overshoot = Math.min(SHEET_OVERSHOOT_MAX, (smallest - height) / SHEET_OVERSHOOT_DIVISOR);
    return largest - smallest + overshoot;
  }

  // Ends a drag at `index`: the settle continues from the finger's offset.
  private _settleFromDrag(index: number): void {
    this._targetIndex = index;
    this._motion.settle(this._offsetOf(index), () => {
      this._motion.rest();
      this._arrive(index);
    });
  }

  // A settle that finishes after destroy writes nothing to a destroyed model.
  private _arrive(index: number): void {
    if (this._overlayRef === null) return;
    this.detent.set(this.detents()[index].id);
  }

  // Opacity of the scrim at `offset` below the largest detent: 0 up to the
  // detent below `modalFrom`, rising across the gap into it, 1 from there on.
  // It takes the offset rather than a share of the travel because at rest the
  // engine holds no surface and knows no travel.
  private _backdropOpacityAt(offset: number): number {
    const from = this.modalFrom();
    if (from === null) return 0;
    const fromIndex = this.detents().findIndex(candidate => candidate.id === from);
    if (fromIndex === -1) return 0;
    if (fromIndex === 0) return 1;

    const modalOffset = this._offsetOf(fromIndex);
    const belowOffset = this._offsetOf(fromIndex - 1);
    if (belowOffset === modalOffset) return offset <= modalOffset ? 1 : 0;
    return Math.min(1, Math.max(0, (belowOffset - offset) / (belowOffset - modalOffset)));
  }

  // The highest detent that is not modal, or the lowest when `modalFrom` is it.
  private _collapseBelowModal(): void {
    const from = this.modalFrom();
    if (from === null) return;
    const fromIndex = this.detents().findIndex(candidate => candidate.id === from);
    this._settleTo(Math.max(0, fromIndex - 1));
  }

  // While modal the rest of the page is inert and focus stays in the panel,
  // landing on the header button — the one control that explains the state
  // and undoes it — unless a pointer made the change (see
  // `_focusHeaderUnlessPointer`). Leaving modal releases both. When the sheet stays, focus
  // goes back to the header only if it has nowhere better to be — nothing
  // focused, the body, or still inside the panel; focus already elsewhere (another
  // overlay, the page) is left where it is. When the sheet is going, focus
  // returns to what the page had focused.
  // Elements already inert are someone else's, so they are neither taken nor
  // released.
  private _applyModality(modal: boolean, restoreTo: sheetFocusRestoreTarget): void {
    if (modal) {
      if (this._focusTrap !== null) return;
      const panel = this._panel().nativeElement;
      // Read before the page goes inert, which blurs what it held. Focus
      // already inside the panel is not the page's to return to.
      const focused = this._document.activeElement;
      this._focusBeforeModal =
        focused instanceof HTMLElement && !panel.contains(focused) ? focused : null;
      const container = this._overlayContainer.getContainerElement();
      this._inerted = Array.from(this._document.body.children).filter(
        child => child !== container && !child.hasAttribute('inert'),
      );
      for (const element of this._inerted) this._renderer.setAttribute(element, 'inert', '');
      this._focusTrap = this._focusTrapFactory.create(panel);
      this._focusHeaderUnlessPointer();
      return;
    }

    if (this._focusTrap === null) return;
    this._focusTrap.destroy();
    this._focusTrap = null;
    for (const element of this._inerted) this._renderer.removeAttribute(element, 'inert');
    this._inerted = [];
    const focusBeforeModal = this._focusBeforeModal;
    this._focusBeforeModal = null;
    if (restoreTo === 'header') {
      // Modality flips on arrival, well after the move began; by then a page
      // may have handed focus to another overlay, which keeps it.
      const active = this._document.activeElement;
      if (
        active === null ||
        active === this._document.body ||
        this._panel().nativeElement.contains(active)
      ) {
        this._focusHeaderUnlessPointer();
      }
      return;
    }
    if (focusBeforeModal !== null && focusBeforeModal.isConnected) focusBeforeModal.focus();
  }

  // Keyboard users, and changes made before any interaction or by code, get
  // the header focused. After a pointer interaction focus stays put: with the
  // page inert a pointer user's focus rests on `body`, and the first Tab lands
  // on the header anyway, so moving focus would only paint a ring nobody asked for.
  private _focusHeaderUnlessPointer(): void {
    const modality = this._inputModalityDetector.mostRecentModality;
    if (modality === 'mouse' || modality === 'touch') return;
    this._header().nativeElement.focus();
  }

  // Lifecycle
  public ngOnDestroy(): void {
    this._applyModality(false, 'page');
    this._renderer.removeStyle(
      this._document.documentElement,
      SHEET_COLLAPSED_SIZE_PROPERTY,
      RendererStyleFlags2.DashCase,
    );
    const overlayRef = this._overlayRef;
    if (overlayRef === null) return;
    this._overlayRef = null;
    // A destroy that lands mid-settle waits for the panel's frame and the
    // backdrop's fade to finish, so neither is cut short.
    void whenAnimationsFinish(this._root().nativeElement, { subtree: true }).then(() =>
      overlayRef.dispose(),
    );
  }
}
