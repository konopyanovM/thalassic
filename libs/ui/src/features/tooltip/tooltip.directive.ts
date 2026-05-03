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
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { Point } from '@thalassic/core';
import { Tooltip } from './tooltip';
import { TooltipService } from './tooltip.service';
import { TOOLTIP_CONFIG } from './tooltip.token';
import { tooltipColor, tooltipOrigin, tooltipPosition } from './tooltip.types';
import { buildTooltipPositions } from './tooltip.utils';

@Directive({
  selector: '[tlsTooltip]',
  providers: [TooltipService],
  host: {
    '(mouseenter)': 'onMouseEnter($event)',
    '(mousemove)': 'onMouseMove($event)',
    '(mouseleave)': 'onMouseLeave()',
    '(touchstart)': 'onTouchStart($event)',
  },
})
export class TooltipDirective implements OnDestroy {
  private _tooltipService = inject(TooltipService);
  private _elementRef = inject(ElementRef);
  private _config = inject(TOOLTIP_CONFIG);

  public content = input<string | TemplateRef<unknown>>('Hello', { alias: 'tlsTooltip' });
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

    return buildTooltipPositions(this.tooltipPosition(), this.tooltipOffset());
  });

  // Protected methods
  protected onMouseEnter(event: MouseEvent) {
    this._show(event);
  }

  protected onMouseMove(event: MouseEvent) {
    if (this.tooltipOrigin() === 'cursor') {
      this._tooltipService.move({ x: event.clientX, y: event.clientY }, this._positions());
    }
  }

  protected onMouseLeave() {
    this._tooltipService.dispose();
  }

  protected onTouchStart(event: TouchEvent) {
    event.preventDefault();
    if (this._visible()) {
      this._hide();
    } else {
      this._show(event.touches[0]);
    }
  }

  // Private methods
  private _show(event: MouseEvent | Touch) {
    if (this.tooltipDisabled()) return;
    this._visible.set(true);

    const tooltipPortal = new ComponentPortal(Tooltip);
    const origin: FlexibleConnectedPositionStrategyOrigin =
      this.tooltipOrigin() === 'cursor'
        ? { x: event.clientX, y: event.clientY }
        : this._elementRef.nativeElement;
    const tooltipRef = this._tooltipService.show(origin, this._positions(), tooltipPortal);

    tooltipRef.instance.content.set(this.content());
    tooltipRef.instance.templateData.set(this.data());
    tooltipRef.instance.color.set(this.tooltipColor());
  }

  private _hide() {
    this._tooltipService.dispose();
    this._visible.set(false);
  }

  // Lifecycle
  ngOnDestroy() {
    this._tooltipService.dispose();
  }
}
