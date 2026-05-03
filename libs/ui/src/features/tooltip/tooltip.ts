import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, model, ModelSignal, Signal, TemplateRef } from '@angular/core';
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
  },
})
export class Tooltip {
  public content: ModelSignal<string | TemplateRef<unknown>> = model.required();
  public templateData: ModelSignal<unknown> = model<unknown>(null);
  public color: ModelSignal<tooltipColor> = model.required<tooltipColor>();

  protected isString: Signal<boolean> = computed(() => typeof this.content() === 'string');
  protected templateRef: Signal<TemplateRef<unknown> | null> = computed(() => {
    if (this.isString()) return null;
    return this.content() as TemplateRef<unknown>;
  });

  protected hostClasses = computed(() => {
    const className = 'tls-tooltip';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);

    return array;
  });
}
