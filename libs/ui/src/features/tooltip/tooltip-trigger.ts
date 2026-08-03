import { ConnectedPosition, FlexibleConnectedPositionStrategyOrigin } from '@angular/cdk/overlay';
import {
  computed,
  Directive,
  inject,
  input,
  InputSignal,
  OnDestroy,
  Renderer2,
  Signal,
  TemplateRef,
} from '@angular/core';
import { Point } from '@thalassic/core';
import { addDescribedBy, buildOverlayPositions, removeDescribedBy } from '../../utils';
import { TooltipService } from './tooltip.service';
import { TOOLTIP_CONFIG } from './tooltip.token';
import { tooltipColor, tooltipOrigin, tooltipPosition } from './tooltip.types';

/**
 * Shared machinery behind every tooltip trigger: the appearance inputs, the overlay lifecycle,
 * and the `aria-describedby` link. A subclass owns only *when* a tooltip opens and *which*
 * element it anchors to — `[tlsTooltip]` binds its own host, `[tlsTooltipDelegate]` resolves an
 * item out of a delegated event — and calls `_show` / `_hide` accordingly.
 *
 * One tooltip is visible at a time per trigger; showing for a different anchor closes the
 * previous one first, and showing for the anchor already open is a no-op so a hovered element
 * receiving focus does not rebuild the overlay.
 */
@Directive({
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export abstract class TooltipTrigger implements OnDestroy {
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
  /** Element the visible tooltip is anchored to, `null` while nothing is shown. */
  private _anchor: HTMLElement | null = null;
  /** Id of the description the visible tooltip added, so only that one is taken back. */
  private _describedById: string | null = null;

  // Computed
  protected readonly _positions: Signal<ConnectedPosition[]> = computed(() => {
    const positions = this.tooltipPositions();
    if (positions) return positions;

    return buildOverlayPositions(this.tooltipPosition(), this.tooltipOffset());
  });

  // Accessors
  /** Anchor of the visible tooltip, for a subclass deciding whether an event concerns it. */
  protected get anchor(): HTMLElement | null {
    return this._anchor;
  }

  // Protected methods
  /** Dismisses the tooltip without moving the pointer or focus (WCAG 1.4.13). */
  protected onEscape(): void {
    this._hide();
  }

  /**
   * Opens the tooltip for `anchor`. `point` anchors to the cursor instead, when the origin is
   * configured that way and the caller has a pointer position to give.
   */
  protected _show(
    anchor: HTMLElement,
    content: string | TemplateRef<unknown>,
    data: unknown = null,
    point?: Point,
  ): void {
    if (this.tooltipDisabled()) return;
    // Re-showing for the anchor already open would rebuild the overlay for nothing.
    if (this._anchor === anchor) return;
    // Nothing to render — empty content would show a bare bubble.
    if (!content) return;

    this._hide();
    this._anchor = anchor;

    const origin: FlexibleConnectedPositionStrategyOrigin =
      this.tooltipOrigin() === 'cursor' && point ? point : anchor;
    const tooltipRef = this._tooltipService.show(origin, this._positions());

    tooltipRef.instance.content.set(content);
    tooltipRef.instance.templateData.set(data);
    tooltipRef.instance.color.set(this.tooltipColor());
    tooltipRef.instance.arrow.set(this.tooltipArrow());

    // A description identical to the accessible name would be announced twice; the tooltip is
    // purely visual then and the link is omitted.
    if (anchor.getAttribute('aria-label') === content) return;

    this._describedById = tooltipRef.instance.id;
    addDescribedBy(this._renderer, anchor, this._describedById);
  }

  protected _hide(): void {
    const anchor = this._anchor;
    if (!anchor) return;

    this._anchor = null;
    this._tooltipService.hide();
    this._undescribe(anchor);
  }

  // Private methods
  /** Takes back only the description this trigger added, leaving the consumer's own intact. */
  private _undescribe(anchor: HTMLElement): void {
    const describedById = this._describedById;
    if (!describedById) return;

    this._describedById = null;
    removeDescribedBy(this._renderer, anchor, describedById);
  }

  // Lifecycle
  ngOnDestroy(): void {
    const anchor = this._anchor;
    if (anchor) this._undescribe(anchor);

    this._anchor = null;
    this._tooltipService.dispose();
  }
}
