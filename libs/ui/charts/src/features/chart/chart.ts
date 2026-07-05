import {
  afterNextRender,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  Signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ThemeService } from '@thalassic/core';
import {
  Chart as ChartJS,
  ChartConfigurationCustomTypesPerDataset,
  ChartDatasetCustomTypesPerDataset,
  ChartOptions,
} from 'chart.js';
import { CHART_ELEMENT } from '../../abstract/chart';
import { ChartConfig } from './chart.config';
import { ChartService } from './chart.service';
import { CHART_CONFIG } from './chart.token';

@Component({
  selector: 'tls-chart',
  imports: [],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [ChartService],
})
export class Chart implements OnDestroy {
  private _config: ChartConfig = inject<ChartConfig>(CHART_CONFIG);
  private _chartService = inject(ChartService);

  private _themeService = inject(ThemeService, { optional: true });

  protected canvasRef: Signal<ElementRef<HTMLCanvasElement> | undefined> =
    viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected chartElements = contentChildren(CHART_ELEMENT);

  private _chart: ChartJS | null = null;

  public labels = input<unknown[]>([]);
  public options = input<ChartOptions | undefined>(undefined);

  // Computed
  private _options = computed(() => {
    const options = this.options();

    const colorOptions = this._chartService.getColorOptions(this.chartElements());
    if (options) return { ...colorOptions, ...this._config.options, ...options };
    else return { ...colorOptions, ...this._config.options };
  });

  private _datasets: Signal<ChartDatasetCustomTypesPerDataset[]> = computed(() =>
    this.chartElements().map(element => element.dataset()),
  );

  protected hostClasses = computed(() => {
    const className = 'tls-chart';

    const array: string[] = [className];

    return array;
  });

  constructor() {
    afterNextRender(() => {
      if (this.canvasElement) {
        const config: ChartConfigurationCustomTypesPerDataset = {
          options: this._options(),
          data: {
            labels: this.labels(),
            datasets: this._datasets(),
          },
        };

        this._chart = new ChartJS(this.canvasElement, config);
      }
    });

    this._initThemeSync();
  }

  // Accessors
  protected get canvasElement() {
    return this.canvasRef()?.nativeElement;
  }

  // Private methods
  // Recolors the chart when the theme changes. Reacts only to the theme signal;
  // everything else is read untracked so unrelated option/element updates don't
  // trigger a redundant chart update.
  private _initThemeSync(): void {
    if (!this._themeService) return;

    const currentTheme = this._themeService.currentTheme;

    effect(() => {
      currentTheme();

      untracked(() => {
        if (!this._chart) return;

        const colorOptions = this._chartService.getColorOptions(this.chartElements());
        this._chart.options = { ...this._options(), ...colorOptions };
        this._chart.update('none');
      });
    });
  }

  // Lifecycle
  ngOnDestroy(): void {
    if (this._chart) this._chart.destroy();
  }
}
