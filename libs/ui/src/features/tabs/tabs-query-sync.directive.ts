import { Directive, effect, inject, input } from '@angular/core';
import { QuerySyncDirective } from '../../abstract';
import { Tabs } from './tabs';
import { TABS_QUERY_SYNC_CONFIG } from './tabs-query-sync.token';
import { tabValue } from './tabs.types';

/**
 * Mirrors the selected tab into a URL query param. The param is only written
 * once the selection actually changes — the initial selection (the default
 * first tab, or the one restored from the URL) never stamps the param, so a
 * freshly loaded page keeps its URL untouched.
 */
@Directive({
  selector: 'tls-tabs[tlsTabsQuerySync]',
})
export class TabsQuerySyncDirective extends QuerySyncDirective {
  private readonly _tabs = inject(Tabs);
  private readonly _config = inject(TABS_QUERY_SYNC_CONFIG);

  // Inputs
  // The selector doubles as the input, so a valueless `tlsTabsQuerySync` binds `''`.
  // Coerce an empty value back to the configured default param key.
  public readonly tlsTabsQuerySync = input(this._config.paramKey, {
    transform: (value: string) => value || this._config.paramKey,
  });

  // State
  /** Param value captured once at startup, pending until a matching tab resolves. */
  private _pendingRestore: string | null = null;
  private _restoreRead = false;

  /** Last selection mirrored to the URL; `undefined` until the initial selection settles. */
  private _lastSynced: tabValue | undefined;

  constructor() {
    super();

    // Restore the selection from the URL. Tab values may be numbers, so the
    // param is matched against each tab's serialized value; projected tabs
    // resolve after init, so this retries until a match appears.
    effect(() => {
      if (!this._restoreRead) {
        this._restoreRead = true;
        this._pendingRestore = this.readParam(this.tlsTabsQuerySync());
      }
      if (this._pendingRestore === null) return;

      const value = this._tabs.findTabValue(this._pendingRestore);
      if (value === undefined) return;

      this._pendingRestore = null;
      this._tabs.selected.set(value);
    });

    effect(() => {
      const selected = this._tabs.selected();
      const param = this.tlsTabsQuerySync();
      if (selected === undefined) return;

      // The first settled selection is the page's initial state; recording it
      // would stamp the URL on load without any user interaction.
      if (this._lastSynced === undefined) {
        this._lastSynced = selected;
        return;
      }

      if (selected === this._lastSynced) return;
      this._lastSynced = selected;
      this.syncToUrl(param, selected);
    });
  }
}
