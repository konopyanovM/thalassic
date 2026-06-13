import { Component, forwardRef } from '@angular/core';
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';
import { CHART_ELEMENT, ChartElement } from '../../../abstract/chart';

@Component({
  selector: 'tls-line-chart',
  template: '',
  providers: [{ provide: CHART_ELEMENT, useExisting: forwardRef(() => LineChart) }],
})
export class LineChart extends ChartElement<'line'> {
  public readonly type = 'line';

  constructor() {
    super();

    ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale);
  }
}
