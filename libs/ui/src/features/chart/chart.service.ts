import { ElementRef, inject, Injectable } from '@angular/core';
import { ChartOptions, ChartTypeRegistry, ScaleOptionsByType } from 'chart.js';
import { DeepPartial } from 'utility-types';
import { ChartElement } from '../../abstract/chart';
import { CARTESIAN_CHARTS, RADIAL_CHARTS } from './chart.constants';
import { chartScaleType } from './chart.types';

@Injectable()
export class ChartService {
  private _elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  public getColorOptions(
    chartElements: readonly ChartElement<keyof ChartTypeRegistry>[],
  ): ChartOptions {
    const scaleTypes = this._getScaleTypes(chartElements);
    const computedStyle = getComputedStyle(this._elementRef.nativeElement);
    return {
      backgroundColor: computedStyle.getPropertyValue('--tls-chart-background-color'),
      borderColor: computedStyle.getPropertyValue('--tls-chart-border-color'),
      color: computedStyle.getPropertyValue('--tls-chart-color'),
      scales: this._getScales(scaleTypes),
    };
  }

  // Private methods
  private _getScales(scaleTypes: chartScaleType[]): {
    [key: string]: DeepPartial<ScaleOptionsByType>;
  } {
    const scales: { [key: string]: DeepPartial<ScaleOptionsByType> } = {};

    if (scaleTypes.includes('cartesian')) {
      scales['x'] = this._getCartesianScales('x');
      scales['y'] = this._getCartesianScales('y');
    }
    if (scaleTypes.includes('radial')) {
      scales['r'] = this._getRadialScales();
    }

    return scales;
  }

  private _getCartesianScales(
    axis: 'x' | 'y',
  ): DeepPartial<
    ScaleOptionsByType<'linear' | 'logarithmic' | 'category' | 'time' | 'timeseries'>
  > {
    const computedStyle = getComputedStyle(this._elementRef.nativeElement);
    return {
      ticks: {
        color: computedStyle.getPropertyValue(`--tls-chart-${axis}-ticks-color`),
      },
      grid: {
        color: computedStyle.getPropertyValue(`--tls-chart-${axis}-grid-color`),
      },
      border: {
        color: computedStyle.getPropertyValue(`--tls-chart-${axis}-axis-color`),
      },
    };
  }

  private _getRadialScales(): DeepPartial<ScaleOptionsByType<'radialLinear'>> {
    const computedStyle = getComputedStyle(this._elementRef.nativeElement);
    return {
      angleLines: {
        color: computedStyle.getPropertyValue('--tls-chart-r-angle-lines-color'),
      },
      grid: {
        color: computedStyle.getPropertyValue('--tls-chart-r-grid-color'),
      },
      pointLabels: {
        color: computedStyle.getPropertyValue('--tls-chart-r-labels-color'),
      },
      ticks: {
        color: computedStyle.getPropertyValue('--tls-chart-r-ticks-color'),
        backdropColor: computedStyle.getPropertyValue('--tls-chart-r-ticks-backdrop-color'),
      },
    };
  }

  private _getScaleTypes(
    chartElements: readonly ChartElement<keyof ChartTypeRegistry>[],
  ): chartScaleType[] {
    const types: chartScaleType[] = [];
    if (chartElements.some(element => CARTESIAN_CHARTS.includes(element.type)))
      types.push('cartesian');
    if (chartElements.some(element => RADIAL_CHARTS.includes(element.type))) types.push('radial');
    return types;
  }
}
