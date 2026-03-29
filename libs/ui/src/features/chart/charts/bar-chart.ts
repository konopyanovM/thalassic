import { Component, forwardRef } from '@angular/core';
import { BarController, BarElement, CategoryScale, Chart as ChartJS, LinearScale } from 'chart.js';
import { CHART_ELEMENT, ChartElement } from '../../../abstract/chart';

@Component({
  selector: 'tls-bar-chart',
  template: '',
  providers: [{ provide: CHART_ELEMENT, useExisting: forwardRef(() => BarChart) }],
})
export class BarChart extends ChartElement<'bar'> {
  public readonly type = 'bar';

  constructor() {
    super();

    ChartJS.register(BarController, BarElement, CategoryScale, LinearScale);
  }
}
