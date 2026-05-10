import {
  afterNextRender,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  Signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class Chart implements OnInit, OnDestroy {
  private _config: ChartConfig = inject<ChartConfig>(CHART_CONFIG);
  private _chartService = inject(ChartService);
  private _destroyRef = inject(DestroyRef);

  private _themeService = inject(ThemeService, { optional: true });

  protected canvasRef: Signal<ElementRef<HTMLCanvasElement> | undefined> =
    viewChild<ElementRef<HTMLCanvasElement>>('canvasRef');

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
  }

  // Accessors
  protected get canvasElement() {
    return this.canvasRef()?.nativeElement;
  }

  // Private methods
  private _tryInitThemeListener() {
    if (this._themeService) {
      this._themeService.onThemeChange.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
        if (this._chart) {
          const colorOptions = this._chartService.getColorOptions(this.chartElements());
          this._chart.options = { ...this._options(), ...colorOptions };
          this._chart.update('none');
        }
      });
    }
  }

  // Lifecycle
  ngOnInit() {
    this._tryInitThemeListener();
  }

  ngOnDestroy() {
    if (this._chart) this._chart.destroy();
  }
}
