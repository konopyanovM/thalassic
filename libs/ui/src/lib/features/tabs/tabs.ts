import {
  Component,
  computed,
  contentChildren,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import { Tab } from './tab/tab';
import { TabsConfig } from './tabs.config';
import { TabsService } from './tabs.service';
import { TABS_CONFIG } from './tabs.token';
import { tabsVariant, tabValue } from './tabs.types';

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

  private _allTabs = contentChildren(Tab);

  public readonly variant: InputSignal<tabsVariant> = input<tabsVariant>(this._config.variant);
  public readonly selected: ModelSignal<tabValue | null> = model<tabValue | null>(null);

  protected hostClasses = computed(() => {
    const className = 'tls-tabs';

    const array: string[] = [className];

    array.push(`${className}--${this.variant()}`);

    return array;
  });

  constructor() {
    this._tabsService.selected = this.selected.asReadonly();
  }

  // Accessors
  protected get tabs(): Signal<readonly Tab[]> {
    return this._allTabs;
  }
}
