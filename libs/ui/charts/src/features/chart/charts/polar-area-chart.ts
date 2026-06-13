import { Component, forwardRef } from '@angular/core';
import { ArcElement, Chart as ChartJS, PolarAreaController, RadialLinearScale } from 'chart.js';
import { CHART_ELEMENT, ChartElement } from '../../../abstract/chart';

@Component({
  selector: 'tls-polar-area-chart',
  template: '',
  providers: [{ provide: CHART_ELEMENT, useExisting: forwardRef(() => PolarAreaChart) }],
})
export class PolarAreaChart extends ChartElement<'polarArea'> {
  public readonly type = 'polarArea';

  constructor() {
    super();

    ChartJS.register(PolarAreaController, ArcElement, RadialLinearScale);
  }
}
