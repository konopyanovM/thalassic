import { Directive, effect, inject, input, OnInit } from '@angular/core';
import { QuerySyncDirective } from '../../abstract';
import { Pagination } from './pagination';
import { PAGINATION_QUERY_SYNC_CONFIG } from './pagination-query-sync.token';

/**
 * Mirrors the current page into a URL query param. The param is only written
 * once the page actually changes — the initial page (the default, or the one
 * restored from the URL) never stamps the param, so a freshly loaded page
 * keeps its URL untouched.
 */
@Directive({
  selector: 'tls-pagination[tlsPaginationQuerySync]',
})
export class PaginationQuerySyncDirective extends QuerySyncDirective implements OnInit {
  private readonly _pagination = inject(Pagination);
  private readonly _config = inject(PAGINATION_QUERY_SYNC_CONFIG);

  // Inputs
  // The selector doubles as the input, so a valueless `tlsPaginationQuerySync` binds `''`.
  // Coerce an empty value back to the configured default param key.
  public readonly tlsPaginationQuerySync = input(this._config.paramKey, {
    transform: (value: string) => value || this._config.paramKey,
  });

  // State
  /** Last page mirrored to the URL; `null` until the initial page settles. */
  private _lastSynced: number | null = null;

  constructor() {
    super();
    effect(() => {
      const page = this._pagination.value();
      const param = this.tlsPaginationQuerySync();

      // The first settled page is the page's initial state; recording it would
      // stamp the URL on load without any user interaction.
      if (this._lastSynced === null) {
        this._lastSynced = page;
        return;
      }

      if (page === this._lastSynced) return;
      this._lastSynced = page;
      this.syncToUrl(param, page);
    });
  }

  // Lifecycle
  ngOnInit(): void {
    const raw = this.readParam(this.tlsPaginationQuerySync());
    if (raw === null) return;
    const page = Number(raw);
    if (!Number.isNaN(page) && page >= 1) this._pagination.value.set(page);
  }
}
