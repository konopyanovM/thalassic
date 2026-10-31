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
import { TABS_CONFIG } from './tabs.token';
import {
  tabsHeaderAlign,
  tabsHeaderPosition,
  tabsItemsAlign,
  tabsOrientation,
  tabsVariant,
  tabValue,
} from './tabs.types';

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
  public readonly headerAlign: InputSignal<tabsHeaderAlign> = input<tabsHeaderAlign>(
    this._config.headerAlign,
  );
  public readonly itemsAlign: InputSignal<tabsItemsAlign> = input<tabsItemsAlign>(
    this._config.itemsAlign,
  );
  public readonly selected: ModelSignal<tabValue | undefined> = model<tabValue | undefined>(
    undefined,
  );

  /** Accessible name for the tablist. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  // State
  protected tabs: Signal<readonly Tab[]> = contentChildren(Tab);

  // Queries
  /** Each tab's header control, in the order of the projected tabs. */
  private readonly _tabControls = viewChildren<ElementRef<HTMLButtonElement>>('tabControl');

  // Computed
  protected hostClasses = computed(() => {
    const className = 'tls-tabs';

    const array: string[] = [className];

    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.orientation()}`);
    array.push(`${className}--header-${this.headerPosition()}`);

    return array;
  });

  /**
   * The header strip uses the shared tab-header block (also rendered by
   * `tls-tab-nav`), so its variant/orientation/alignment modifiers live on the
   * strip element itself rather than on the tabs container.
   */
  protected headerClasses = computed(() => {
    const className = 'tls-tab-header';

    const array: string[] = [className];

    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.orientation()}`);
    array.push(`${className}--align-${this.headerAlign()}`);
    array.push(`${className}--items-${this.itemsAlign()}`);

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

  /**
   * Moves keyboard focus to the header control of the tab holding `value`.
   * Meant for a control inside a panel that switches to another tab: the
   * switch hides the panel and, with it, the element that had focus, which
   * would otherwise fall back to the document. Takes the value rather than
   * reading the selection, so a caller can focus the tab it has just selected
   * before the selection reaches this component.
   */
  public focusTab(value: tabValue): void {
    const index = this.tabs().findIndex(tab => tab.value() === value);
    const control = this._tabControls()[index];
    if (!control) return;
    control.nativeElement.focus();
  }
}
