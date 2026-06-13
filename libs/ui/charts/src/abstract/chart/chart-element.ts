import { Directive, InjectionToken, input, InputSignalWithTransform } from '@angular/core';
import { ChartDataset, ChartDatasetCustomTypesPerDataset, ChartType } from 'chart.js';

export const CHART_ELEMENT = new InjectionToken<ChartElement>('CHART_ELEMENT');

@Directive()
export abstract class ChartElement<T extends ChartType = ChartType> {
  public abstract readonly type: T;

  public dataset: InputSignalWithTransform<ChartDatasetCustomTypesPerDataset<T>, ChartDataset> =
    input.required<ChartDatasetCustomTypesPerDataset<T>, ChartDataset>({
      transform: value =>
        ({
          type: this.type,
          ...value,
        }) as ChartDatasetCustomTypesPerDataset<T>,
    });
}
