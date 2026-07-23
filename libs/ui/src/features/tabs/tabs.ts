import { Directionality } from '@angular/cdk/bidi';
import {
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
  viewChildren,
} from '@angular/core';
import { Tab } from './tab';
import { TabsConfig } from './tabs.config';
import { TabsService } from './tabs.service';
import { TABS_CONFIG } from './tabs.token';
import { tabsOrientation, tabsVariant, tabValue } from './tabs.types';

@Component({
  selector: 'tls-tabs',
  imports: [],
  templateUrl: './tabs.html',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [TabsService],
})
export class Tabs {
  private _config: TabsConfig = inject(TABS_CONFIG);
  private _tabsService: TabsService = inject(TabsService);
  private readonly _directionality = inject(Directionality);

  protected tabs: Signal<readonly Tab[]> = contentChildren(Tab);

  private _tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  public readonly variant: InputSignal<tabsVariant> = input<tabsVariant>(this._config.variant);
  public readonly orientation: InputSignal<tabsOrientation> = input<tabsOrientation>(
    this._config.orientation,
  );
  public readonly selected: ModelSignal<tabValue | null> = model<tabValue | null>(null);

  /** Accessible name for the tablist. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  protected focusableTabValue = computed(() => {
    const selected = this.selected();
    if (selected !== null) return selected;

    const firstEnabledTab = this.tabs().find(tab => !tab.disabled());
    if (firstEnabledTab) return firstEnabledTab.value();
    return null;
  });

  protected hostClasses = computed(() => {
    const className = 'tls-tabs';

    const array: string[] = [className];

    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.orientation()}`);

    return array;
  });

  constructor() {
    this._tabsService.selected = this.selected.asReadonly();
  }

  // Protected methods
  protected onKeydown(event: KeyboardEvent, index: number): void {
    const orientation = this.orientation();
    // Horizontal arrows are physical; swap them in RTL so Next still advances.
    const isRtl = this._directionality.value === 'rtl';
    const horizontalNext = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const horizontalPrev = isRtl ? 'ArrowRight' : 'ArrowLeft';
    const keyNext = orientation === 'horizontal' ? horizontalNext : 'ArrowDown';
    const keyPrev = orientation === 'horizontal' ? horizontalPrev : 'ArrowUp';

    let target: number | null = null;

    switch (event.key) {
      case keyNext:
        target = this._nextFocusable(index, 1);
        break;
      case keyPrev:
        target = this._nextFocusable(index, -1);
        break;
      case 'Home':
        target = this._nextFocusable(-1, 1);
        break;
      case 'End':
        target = this._nextFocusable(this.tabs().length, -1);
        break;
      default:
        return;
    }

    event.preventDefault();
    if (target === null) return;

    const tab = this.tabs()[target];
    this._tabButtons()[target].nativeElement.focus();
    this.selected.set(tab.value());
  }

  // Private methods
  private _nextFocusable(from: number, direction: 1 | -1): number | null {
    const tabs = this.tabs();
    for (let index = from + direction; index >= 0 && index < tabs.length; index += direction) {
      if (!tabs[index].disabled()) return index;
    }
    return null;
  }
}
