import { Component, forwardRef } from '@angular/core';
import { Chart as ChartJS, LinearScale, PointElement, ScatterController } from 'chart.js';
import { CHART_ELEMENT, ChartElement } from '../../../abstract/chart';

@Component({
  selector: 'tls-scatter-chart',
  template: '',
  providers: [{ provide: CHART_ELEMENT, useExisting: forwardRef(() => ScatterChart) }],
})
export class ScatterChart extends ChartElement<'scatter'> {
  public readonly type = 'scatter';

  constructor() {
    super();

    ChartJS.register(ScatterController, PointElement, LinearScale);
  }
}
