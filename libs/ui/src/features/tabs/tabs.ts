import {
  Tab as AriaTab,
  TabContent,
  TabList,
  TabPanel,
  Tabs as AriaTabs,
} from '@angular/aria/tabs';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import { Tab } from './tab';
import { TabsConfig } from './tabs.config';
import { TABS_CONFIG } from './tabs.token';
import { tabsHeaderPosition, tabsOrientation, tabsVariant, tabValue } from './tabs.types';

@Component({
  selector: 'tls-tabs',
  imports: [TabList, AriaTab, TabPanel, TabContent, NgTemplateOutlet],
  templateUrl: './tabs.html',
  hostDirectives: [AriaTabs],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Tabs {
  private _config: TabsConfig = inject(TABS_CONFIG);

  protected tabs: Signal<readonly Tab[]> = contentChildren(Tab);

  public readonly variant: InputSignal<tabsVariant> = input<tabsVariant>(this._config.variant);
  public readonly orientation: InputSignal<tabsOrientation> = input<tabsOrientation>(
    this._config.orientation,
  );
  public readonly headerPosition: InputSignal<tabsHeaderPosition> = input<tabsHeaderPosition>(
    this._config.headerPosition,
  );
  public readonly selected: ModelSignal<tabValue | undefined> = model<tabValue | undefined>(
    undefined,
  );

  /** Accessible name for the tablist. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  protected hostClasses = computed(() => {
    const className = 'tls-tabs';

    const array: string[] = [className];

    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.orientation()}`);
    array.push(`${className}--header-${this.headerPosition()}`);

    return array;
  });

  // The header strip uses the shared tab-header block (also rendered by
  // `tls-tab-nav`), so its variant/orientation modifiers live on the strip
  // element itself rather than on the tabs container.
  protected headerClasses = computed(() => {
    const className = 'tls-tab-header';

    const array: string[] = [className];

    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.orientation()}`);

    return array;
  });

  constructor() {
    effect(() => {
      if (this.selected() !== undefined) return;

      const firstEnabledTab = this.tabs().find(tab => !tab.disabled());
      if (firstEnabledTab) this.selected.set(firstEnabledTab.value());
    });
  }
}
