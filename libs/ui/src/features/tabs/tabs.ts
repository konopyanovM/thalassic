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
  // Injections
  private readonly _config: TabsConfig = inject(TABS_CONFIG);

  // Inputs
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

  // State
  protected tabs: Signal<readonly Tab[]> = contentChildren(Tab);

  // Computed
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

  // Constructor
  constructor() {
    effect(() => {
      if (this.selected() !== undefined) return;

      const firstEnabledTab = this.tabs().find(tab => !tab.disabled());
      if (firstEnabledTab) this.selected.set(firstEnabledTab.value());
    });
  }

  // Public methods
  /**
   * Resolves arbitrary text (e.g. a URL query param) to the value of the tab it
   * names, so a caller can tell an actual tab from a stale or hand-edited
   * value. Returns `undefined` when no tab matches — including while the
   * projected tabs have not resolved yet, so a reactive caller can retry once
   * they have.
   */
  public findTabValue(text: string): tabValue | undefined {
    const match = this.tabs().find(tab => tab.value() === text);
    if (!match) return undefined;
    return match.value();
  }
}
