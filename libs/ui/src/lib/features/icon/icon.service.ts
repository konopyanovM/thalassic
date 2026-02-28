import { HttpClient } from '@angular/common/http';
import { inject, Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { map, Observable, shareReplay, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IconService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _sanitizer: DomSanitizer = inject(DomSanitizer);

  private readonly _cache = new Map<string, Observable<SafeHtml>>();

  public getSvgContent(
    url: string,
    allowedSources: string[],
  ): Observable<SafeHtml> {
    if (allowedSources.length > 0 && !this._isUrlAllowed(url, allowedSources)) {
      return throwError(() => new Error('SVG URL not from trusted source'));
    }

    const cache = this._cache.get(url);

    if (!cache) {
      const svg$ = this._http.get(url, { responseType: 'text' }).pipe(
        map(svg => this._sanitizeSvg(svg)),
        shareReplay(1),
      );
      this._cache.set(url, svg$);
      return svg$;
    }

    return cache;
  }

  // Private methods
  private _isUrlAllowed(url: string, allowedSource: string[]): boolean {
    return allowedSource.some(source => url.startsWith(source));
  }

  private _sanitizeSvg(svg: string): SafeHtml {
    return this._sanitizer.sanitize(SecurityContext.HTML, svg) || '';
  }
}
