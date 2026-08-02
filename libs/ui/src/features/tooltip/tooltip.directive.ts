import { ConnectedPosition, FlexibleConnectedPositionStrategyOrigin } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  InputSignal,
  OnDestroy,
  Renderer2,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { Point } from '@thalassic/core';
import { buildOverlayPositions } from '../../utils';
import { Tooltip } from './tooltip';
import { TooltipService } from './tooltip.service';
import { TOOLTIP_CONFIG } from './tooltip.token';
import { tooltipColor, tooltipOrigin, tooltipPosition } from './tooltip.types';

/**
 * Attaches a tooltip to the host element. Shows on hover and on keyboard focus,
 * toggles on touch, and dismisses on Escape without moving the pointer or focus
 * (WCAG 1.4.13). The tooltip is linked to the host via `aria-describedby` while
 * visible.
 *
 * Interaction is driven by pointer events, branching on `pointerType`: mouse
 * and pen get hover semantics, touch gets tap-to-toggle. A single stream avoids
 * the synthesized mouse events browsers replay after a tap.
 */
@Directive({
  selector: '[tlsTooltip]',
  providers: [TooltipService],
  host: {
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerleave)': 'onPointerLeave($event)',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class TooltipDirective implements OnDestroy {
  private _tooltipService = inject(TooltipService);
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _config = inject(TOOLTIP_CONFIG);

  public content = input<string | TemplateRef<unknown>>('', { alias: 'tlsTooltip' });
  public data: InputSignal<unknown> = input<unknown>(null);
  public tooltipDisabled: InputSignal<boolean> = input<boolean>(false);
  public tooltipOrigin: InputSignal<tooltipOrigin> = input<tooltipOrigin>(this._config.origin);
  public tooltipPositions: InputSignal<ConnectedPosition[] | undefined> = input<
    ConnectedPosition[] | undefined
  >(this._config.positions);
  public tooltipPosition: InputSignal<tooltipPosition> = input<tooltipPosition>(
    this._config.position,
  );
  public tooltipOffset: InputSignal<Point> = input<Point>(this._config.offset);
  public tooltipColor: InputSignal<tooltipColor> = input<tooltipColor>(this._config.color);

  private _visible: WritableSignal<boolean> = signal<boolean>(false);

  private _positions = computed(() => {
    const positions = this.tooltipPositions();
    if (positions) return positions;

    return buildOverlayPositions(this.tooltipPosition(), this.tooltipOffset());
  });

  // Protected methods
  protected onPointerEnter(event: PointerEvent) {
    // A touch "enter" is a tap, not a hover — toggle instead. The default is
    // not prevented, so the tap still activates an interactive host.
    if (event.pointerType === 'touch') {
      if (this._visible()) {
        this._hide();
      } else {
        this._show();
      }
      return;
    }

    this._show({ x: event.clientX, y: event.clientY });
  }

  protected onPointerMove(event: PointerEvent) {
    if (event.pointerType === 'touch') return;

    if (this.tooltipOrigin() === 'cursor') {
      this._tooltipService.move({ x: event.clientX, y: event.clientY }, this._positions());
    }
  }

  protected onPointerLeave(event: PointerEvent) {
    // A tap retires its pointer immediately, firing `pointerleave` within the
    // same gesture; hiding here would undo the toggle the tap just made.
    if (event.pointerType === 'touch') return;

    this._hide();
  }

  protected onFocus() {
    // No cursor to anchor to; a focus-triggered tooltip always anchors to the element.
    this._show();
  }

  protected onBlur() {
    this._hide();
  }

  /** Dismisses the tooltip without moving the pointer or focus (WCAG 1.4.13). */
  protected onEscape() {
    if (this._visible()) this._hide();
  }

  // Private methods
  private _show(point?: Point) {
    if (this.tooltipDisabled() || this._visible()) return;

    // Nothing to render — an empty string would show a bare bubble.
    const content = this.content();
    if (content === '') return;

    this._visible.set(true);

    const tooltipPortal = new ComponentPortal(Tooltip);
    const origin: FlexibleConnectedPositionStrategyOrigin =
      this.tooltipOrigin() === 'cursor' && point ? point : this._elementRef.nativeElement;
    const tooltipRef = this._tooltipService.show(origin, this._positions(), tooltipPortal);

    tooltipRef.instance.content.set(content);
    tooltipRef.instance.templateData.set(this.data());
    tooltipRef.instance.color.set(this.tooltipColor());

    this._renderer.setAttribute(
      this._elementRef.nativeElement,
      'aria-describedby',
      tooltipRef.instance.id,
    );
  }

  private _hide() {
    if (!this._visible()) return;
    this._tooltipService.hide();
    this._visible.set(false);
    this._renderer.removeAttribute(this._elementRef.nativeElement, 'aria-describedby');
  }

  // Lifecycle
  ngOnDestroy(): void {
    this._tooltipService.dispose();
    this._renderer.removeAttribute(this._elementRef.nativeElement, 'aria-describedby');
  }
}
