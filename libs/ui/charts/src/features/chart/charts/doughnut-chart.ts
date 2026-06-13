import { Component, forwardRef } from '@angular/core';
import { ArcElement, Chart as ChartJS, DoughnutController } from 'chart.js';
import { CHART_ELEMENT, ChartElement } from '../../../abstract/chart';

@Component({
  selector: 'tls-doughnut-chart',
  template: '',
  providers: [{ provide: CHART_ELEMENT, useExisting: forwardRef(() => DoughnutChart) }],
})
export class DoughnutChart extends ChartElement<'doughnut'> {
  public readonly type = 'doughnut';

  constructor() {
    super();

    ChartJS.register(DoughnutController, ArcElement);
  }
}
