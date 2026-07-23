import { Directive, effect, inject, input, OnInit } from '@angular/core';
import { QuerySyncDirective } from '../../abstract';
import { Tabs } from './tabs';
import { TABS_QUERY_SYNC_CONFIG } from './tabs-query-sync.token';

@Directive({
  selector: 'tls-tabs[tlsTabsQuerySync]',
})
export class TabsQuerySyncDirective extends QuerySyncDirective implements OnInit {
  private readonly _tabs = inject(Tabs);
  private readonly _config = inject(TABS_QUERY_SYNC_CONFIG);

  // Inputs
  public readonly tlsTabsQuerySync = input<string>(this._config.paramKey);

  constructor() {
    super();
    effect(() => {
      const selected = this._tabs.selected();
      const param = this.tlsTabsQuerySync();
      if (selected === undefined) return;
      this.syncToUrl(param, selected);
    });
  }

  // Lifecycle
  ngOnInit(): void {
    const value = this.readParam(this.tlsTabsQuerySync());
    if (value !== null) this._tabs.selected.set(value);
  }
}
