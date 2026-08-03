import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, model, ModelSignal, Signal, TemplateRef } from '@angular/core';
import { OverlayArrowPosition } from '../../types';
import { tooltipColor } from './tooltip.types';

@Component({
  selector: 'tls-tooltip',
  template: `
    @if (isString()) {
      {{ content() }}
    } @else {
      <ng-container
        [ngTemplateOutlet]="templateRef()"
        [ngTemplateOutletContext]="{ $implicit: templateData() }"
      ></ng-container>
    }
  `,
  imports: [NgTemplateOutlet],
  host: {
    '[class]': 'hostClasses()',
    'role': 'tooltip',
    '[id]': 'id',
    'animate.enter': 'tls-tooltip--enter',
    'animate.leave': 'tls-tooltip--leave',
  },
})
export class Tooltip {
  private static _counter = 0;

  public readonly id = `tls-tooltip-${++Tooltip._counter}`;

  public content: ModelSignal<string | TemplateRef<unknown>> = model.required();
  public templateData: ModelSignal<unknown> = model<unknown>(null);
  public color: ModelSignal<tooltipColor> = model.required<tooltipColor>();
  public arrow: ModelSignal<boolean> = model.required<boolean>();
  /**
   * Edge the arrow points from, resolved from the position the overlay settled on. It stays
   * `null` until the overlay reports one, so the arrow never renders on a guessed edge.
   */
  public arrowPosition: ModelSignal<OverlayArrowPosition | null> =
    model<OverlayArrowPosition | null>(null);

  protected isString: Signal<boolean> = computed(() => typeof this.content() === 'string');
  protected templateRef: Signal<TemplateRef<unknown> | null> = computed(() => {
    if (this.isString()) return null;
    return this.content() as TemplateRef<unknown>;
  });

  protected hostClasses = computed(() => {
    const className = 'tls-tooltip';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);

    const arrowPosition = this.arrowPosition();
    if (this.arrow() && arrowPosition) {
      array.push(`${className}--arrow`);
      array.push(`${className}--arrow-${arrowPosition.side}`);
      array.push(`${className}--arrow-align-${arrowPosition.alignment}`);
    }

    return array;
  });
}
