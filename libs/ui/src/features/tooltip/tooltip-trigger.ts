import { TOUCH_HANDOVER_WINDOW_MS } from './tooltip.constants';
import { ConnectedPosition, FlexibleConnectedPositionStrategyOrigin } from '@angular/cdk/overlay';
import {
  computed,
  ComponentRef,
  Directive,
  effect,
  inject,
  input,
  InputSignal,
  OnDestroy,
  Renderer2,
  signal,
  Signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { Point } from '@thalassic/core';
import { addDescribedBy, buildOverlayPositions, removeDescribedBy } from '../../utils';
import { Tooltip } from './tooltip';
import { TooltipService } from './tooltip.service';
import { TOOLTIP_CONFIG } from './tooltip.token';
import {
  tooltipColor,
  tooltipOrigin,
  TooltipOwner,
  tooltipPosition,
  TooltipRequest,
  tooltipSource,
} from './tooltip.types';

/**
 * Shared machinery behind every tooltip trigger: the appearance inputs, the overlay lifecycle,
 * and the `aria-describedby` link. A subclass owns only *when* a tooltip opens and *which*
 * element it anchors to — `[tlsTooltip]` binds its own host, `[tlsTooltipDelegate]` resolves an
 * item out of a delegated event — and records or drops show requests accordingly.
 *
 * A tooltip can be asked for by a hover, by keyboard focus, and by a tap at the same time. Each
 * source is tracked on its own and the most recent one is the tooltip on screen, so an
 * interaction ending only takes back what it asked for: a pointer leaving an element that is
 * still focused does not dismiss the tooltip focus is entitled to (WCAG 1.4.13).
 *
 * The tooltip overlay itself is shared across the page, so opening one here closes any other
 * trigger's.
 */
@Directive()
export abstract class TooltipTrigger implements TooltipOwner, OnDestroy {
  // Injections
  protected readonly _tooltipService = inject(TooltipService);
  protected readonly _renderer = inject(Renderer2);
  protected readonly _config = inject(TOOLTIP_CONFIG);

  // Inputs
  public readonly tooltipDisabled: InputSignal<boolean> = input<boolean>(false);
  public readonly tooltipOrigin: InputSignal<tooltipOrigin> = input<tooltipOrigin>(
    this._config.origin,
  );
  public readonly tooltipPositions: InputSignal<ConnectedPosition[] | undefined> = input<
    ConnectedPosition[] | undefined
  >(this._config.positions);
  public readonly tooltipPosition: InputSignal<tooltipPosition> = input<tooltipPosition>(
    this._config.position,
  );
  public readonly tooltipOffset: InputSignal<Point> = input<Point>(this._config.offset);
  public readonly tooltipColor: InputSignal<tooltipColor> = input<tooltipColor>(this._config.color);
  /** Points a small arrow at the anchor. Disable it for a plain bubble. */
  public readonly tooltipArrow: InputSignal<boolean> = input<boolean>(this._config.arrow);

  // State
  /**
   * Live show requests, keyed by the source that made them and held in the order they arrived.
   * The last one in is the one on screen; emptying the map hides the tooltip.
   */
  private readonly _requests = new Map<tooltipSource, TooltipRequest>();
  /** Element the visible tooltip is anchored to, `null` while nothing is shown. */
  private _anchor: HTMLElement | null = null;
  private readonly _tooltipRef: WritableSignal<ComponentRef<Tooltip> | null> =
    signal<ComponentRef<Tooltip> | null>(null);
  /** Id of the description the visible tooltip added, so only that one is taken back. */
  private _describedById: string | null = null;
  /** Element that description was put on, which is not always the anchor. */
  private _describedElement: HTMLElement | null = null;
  /** Teardown of the document listeners that only run while a tooltip is visible. */
  private _dismissListeners: (() => void)[] = [];

  // Computed
  protected readonly _positions: Signal<ConnectedPosition[]> = computed(() => {
    const positions = this.tooltipPositions();
    if (positions) return positions;

    return buildOverlayPositions(this.tooltipPosition(), this.tooltipOffset());
  });

  constructor() {
    // A tooltip already on screen when the trigger is disabled goes with it.
    effect(() => {
      if (this.tooltipDisabled()) this._hideAll();
    });

    // Appearance is applied when the tooltip opens and kept live from there, so an input
    // changing under a visible tooltip reaches it.
    effect(() => {
      const tooltipRef = this._tooltipRef();
      if (!tooltipRef) return;

      tooltipRef.instance.color.set(this.tooltipColor());
      tooltipRef.instance.arrow.set(this.tooltipArrow());
    });
  }

  // Accessors
  /** Anchor of the visible tooltip, for a subclass deciding whether an event concerns it. */
  protected get anchor(): HTMLElement | null {
    return this._anchor;
  }

  // Public methods
  /** Gives up the shared tooltip, along with every reason this trigger was showing one. */
  public releaseTooltip(): void {
    this._requests.clear();
    this._close();
  }

  // Protected methods
  /** Records `source` as wanting the tooltip described by `request`, and shows it. */
  protected _show(source: tooltipSource, request: TooltipRequest): void {
    if (this.tooltipDisabled()) return;
    // Nothing to render — empty content would show a bare bubble.
    if (!request.content) return;

    // Re-inserting moves the request to the end, keeping the map in the order requests arrived.
    this._requests.delete(source);
    this._requests.set(source, request);
    this._present();
  }

  /** Takes back what `source` asked for, leaving a tooltip any other source still wants. */
  protected _hide(source: tooltipSource): void {
    if (!this._requests.delete(source)) return;

    this._present();
  }

  /** Drops every reason at once — a dismissal, rather than the end of one interaction. */
  protected _hideAll(): void {
    if (this._requests.size === 0) return;

    this._requests.clear();
    this._present();
  }

  // Timestamp of the latest touch interaction, for telling a tap-granted focus
  // apart from a keyboard-granted one.
  private _lastTouchAt = 0;

  /** Records that a touch interaction just happened; `_followsTouch` reads it. */
  protected _noteTouch(): void {
    this._lastTouchAt = Date.now();
  }

  /** Whether a focus arriving now was handed over by a touch tap rather than a keyboard. */
  protected _followsTouch(): boolean {
    return Date.now() - this._lastTouchAt < TOUCH_HANDOVER_WINDOW_MS;
  }

  /** Whether the element is, or wraps, a control a tap activates. */
  protected _isInteractive(element: HTMLElement): boolean {
    const interactiveSelector =
      'button, a[href], input, select, textarea, [role="button"]';
    if (element.matches(interactiveSelector)) return true;
    return element.querySelector(interactiveSelector) !== null;
  }

  /** Whether a tap is what is currently holding the tooltip on `anchor`, which another tap ends. */
  protected _isTapped(anchor: HTMLElement): boolean {
    const request = this._requests.get('touch');
    if (!request) return false;

    return request.anchor === anchor;
  }

  /** Re-states the content of every live request, so an input changing reaches a visible tooltip. */
  protected _updateContent(content: string | TemplateRef<unknown>, data: unknown): void {
    if (this._requests.size === 0) return;
    if (!content) {
      this._hideAll();
      return;
    }

    for (const [source, request] of this._requests) {
      this._requests.set(source, { ...request, content, data });
    }
    this._present();
  }

  // Private methods
  /** Brings the tooltip in line with the requests: the newest one, or none at all. */
  private _present(): void {
    const request = this._latestRequest();
    if (!request) {
      this._close();
      return;
    }

    if (this._anchor !== request.anchor) {
      this._close();
      this._open(request);
      return;
    }

    const tooltipRef = this._tooltipRef();
    if (tooltipRef) this._applyContent(tooltipRef, request);
  }

  private _open(request: TooltipRequest): void {
    this._anchor = request.anchor;

    const origin: FlexibleConnectedPositionStrategyOrigin =
      this.tooltipOrigin() === 'cursor' && request.point ? request.point : request.anchor;
    const tooltipRef = this._tooltipService.show(this, origin, this._positions());

    tooltipRef.instance.color.set(this.tooltipColor());
    tooltipRef.instance.arrow.set(this.tooltipArrow());
    this._tooltipRef.set(tooltipRef);

    this._applyContent(tooltipRef, request);
    this._listenWhileVisible();
  }

  private _close(): void {
    if (!this._anchor) return;

    this._anchor = null;
    this._tooltipRef.set(null);
    this._unlisten();
    this._tooltipService.hide(this);
    this._undescribe();
  }

  private _applyContent(tooltipRef: ComponentRef<Tooltip>, request: TooltipRequest): void {
    tooltipRef.instance.content.set(request.content);
    tooltipRef.instance.templateData.set(request.data);
    this._describe(tooltipRef, request);
  }

  /**
   * Links the described element to the tooltip, following focus as it moves between controls the
   * anchor wraps. A description identical to the accessible name would be announced twice; the
   * tooltip is purely visual then and the link is omitted.
   */
  private _describe(tooltipRef: ComponentRef<Tooltip>, request: TooltipRequest): void {
    const element = request.describedElement;

    if (element.getAttribute('aria-label') === request.content) {
      this._undescribe();
      return;
    }
    if (this._describedElement === element && this._describedById) return;

    this._undescribe();
    this._describedElement = element;
    this._describedById = tooltipRef.instance.id;
    addDescribedBy(this._renderer, element, this._describedById);
  }

  /** Takes back only the description this trigger added, leaving the consumer's own intact. */
  private _undescribe(): void {
    const element = this._describedElement;
    const describedById = this._describedById;
    this._describedElement = null;
    this._describedById = null;
    if (!element || !describedById) return;

    removeDescribedBy(this._renderer, element, describedById);
  }

  private _latestRequest(): TooltipRequest | null {
    let latest: TooltipRequest | null = null;
    for (const request of this._requests.values()) latest = request;

    return latest;
  }

  /**
   * Binds the dismissals that belong to a visible tooltip and nothing else, so a page full of
   * triggers carries no document listeners for the tooltips it is not showing.
   */
  private _listenWhileVisible(): void {
    this._unlisten();

    this._dismissListeners.push(
      this._renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
        // Dismissible without moving the pointer or focus (WCAG 1.4.13).
        if (event.key === 'Escape') this._hideAll();
      }),
      // A tap leaves no pointer to move away and no Escape key to press, so the next tap
      // outside the anchor is what takes the tooltip back.
      this._renderer.listen('document', 'pointerdown', (event: PointerEvent) => {
        if (event.pointerType !== 'touch') return;
        if (!this._requests.has('touch')) return;

        const anchor = this._anchor;
        const target = event.target;
        if (anchor && target instanceof Node && anchor.contains(target)) return;

        this._hideAll();
      }),
    );
  }

  private _unlisten(): void {
    for (const unlisten of this._dismissListeners) unlisten();

    this._dismissListeners = [];
  }

  // Lifecycle
  ngOnDestroy(): void {
    this._undescribe();

    this._requests.clear();
    this._anchor = null;
    this._tooltipRef.set(null);
    this._unlisten();
    this._tooltipService.dispose(this);
  }
}
