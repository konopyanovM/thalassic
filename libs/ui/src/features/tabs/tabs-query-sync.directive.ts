import { Directive, effect, inject, input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tabs } from './tabs';
import { TABS_QUERY_SYNC_CONFIG } from './tabs-query-sync.token';

@Directive({
  selector: 'tls-tabs[tlsTabsQuerySync]',
})
export class TabsQuerySyncDirective implements OnInit {
  private readonly _tabs = inject(Tabs);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _config = inject(TABS_QUERY_SYNC_CONFIG);

  // Inputs
  public readonly tlsTabsQuerySync = input<string>(this._config.paramKey);

  constructor() {
    effect(() => {
      const selected = this._tabs.selected();
      const param = this.tlsTabsQuerySync();
      if (selected === null) return;
      void this._router.navigate([], {
        relativeTo: this._route,
        queryParams: { [param]: selected },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  // Lifecycle
  ngOnInit(): void {
    const value = this._route.snapshot.queryParamMap.get(this.tlsTabsQuerySync());
    if (value !== null) this._tabs.selected.set(value);
  }
}
