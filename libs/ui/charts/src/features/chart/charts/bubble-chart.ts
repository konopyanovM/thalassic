import { Component, forwardRef } from '@angular/core';
import { BubbleController, Chart as ChartJS, LinearScale, PointElement } from 'chart.js';
import { CHART_ELEMENT, ChartElement } from '../../../abstract/chart';

@Component({
  selector: 'tls-bubble-chart',
  template: '',
  providers: [{ provide: CHART_ELEMENT, useExisting: forwardRef(() => BubbleChart) }],
})
export class BubbleChart extends ChartElement<'bubble'> {
  public readonly type = 'bubble';

  constructor() {
    super();

    ChartJS.register(BubbleController, PointElement, LinearScale);
  }
}
