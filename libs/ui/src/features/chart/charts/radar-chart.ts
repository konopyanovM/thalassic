import { Component, forwardRef } from '@angular/core';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
} from 'chart.js';
import { CHART_ELEMENT, ChartElement } from '../../../abstract/chart';

@Component({
  selector: 'tls-radar-chart',
  template: '',
  providers: [{ provide: CHART_ELEMENT, useExisting: forwardRef(() => RadarChart) }],
})
export class RadarChart extends ChartElement<'radar'> {
  public readonly type = 'radar';

  constructor() {
    super();

    ChartJS.register(RadarController, LineElement, PointElement, RadialLinearScale);
  }
}
