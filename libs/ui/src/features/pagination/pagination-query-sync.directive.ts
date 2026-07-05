import { Directive, effect, inject, input, OnInit } from '@angular/core';
import { QuerySyncDirective } from '../../abstract';
import { Pagination } from './pagination';
import { PAGINATION_QUERY_SYNC_CONFIG } from './pagination-query-sync.token';

@Directive({
  selector: 'tls-pagination[tlsPaginationQuerySync]',
})
export class PaginationQuerySyncDirective extends QuerySyncDirective implements OnInit {
  private readonly _pagination = inject(Pagination);
  private readonly _config = inject(PAGINATION_QUERY_SYNC_CONFIG);

  // Inputs
  public readonly tlsPaginationQuerySync = input<string>(this._config.paramKey);

  constructor() {
    super();
    effect(() => {
      const page = this._pagination.value();
      const param = this.tlsPaginationQuerySync();
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
