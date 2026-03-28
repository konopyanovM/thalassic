import { Component, computed, inject, input } from '@angular/core';
import { TabsService } from '../tabs.service';
import { tabValue } from '../tabs.types';

@Component({
  selector: 'tls-tab',
  imports: [],
  templateUrl: './tab.html',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Tab {
  private _tabsService: TabsService = inject(TabsService);

  // Inputs
  public value = input.required<tabValue>();
  public label = input.required<string>();

  private _active = computed(() => {
    if (!this._tabsService.selected) return false;

    const selected = this._tabsService.selected();
    if (selected) return this.value() === selected;
    else return false;
  });

  protected hostClasses = computed(() => {
    const className = 'tls-tab';

    const array: string[] = [className];

    if (this._active()) array.push(`${className}--active`);

    return array;
  });
}
