import { Directive, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Directive()
export abstract class QuerySyncDirective {
  protected readonly _router = inject(Router);
  protected readonly _route = inject(ActivatedRoute);

  protected syncToUrl(param: string, value: string | number): void {
    void this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { [param]: value },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected readParam(param: string): string | null {
    return this._route.snapshot.queryParamMap.get(param);
  }
}
