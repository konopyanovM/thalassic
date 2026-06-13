import { Component, forwardRef } from '@angular/core';
import { ArcElement, Chart as ChartJS, PieController } from 'chart.js';
import { CHART_ELEMENT, ChartElement } from '../../../abstract/chart';

@Component({
  selector: 'tls-pie-chart',
  template: '',
  providers: [{ provide: CHART_ELEMENT, useExisting: forwardRef(() => PieChart) }],
})
export class PieChart extends ChartElement<'pie'> {
  public readonly type = 'pie';

  constructor() {
    super();

    ChartJS.register(PieController, ArcElement);
  }
}
