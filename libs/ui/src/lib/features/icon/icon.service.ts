import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { map, Observable, shareReplay, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IconService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _sanitizer: DomSanitizer = inject(DomSanitizer);

  private readonly _cache = new Map<string, Observable<SafeHtml>>();

  public getSvgContent(url: string, allowedSources: string[]): Observable<SafeHtml> {
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
    const safeSvg = this._makeSafe(svg);
    return this._sanitizer.bypassSecurityTrustHtml(safeSvg);
  }

  private _makeSafe(svg: string): string {
    return (
      svg
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers (onclick, onload, onmouseover, etc.)
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        // Remove external xlink:href (keep internal references starting with #)
        .replace(/xlink:href\s*=\s*["'](?!#)[^"']*["']/gi, '')
        // Remove external href in <use>, <image>, <a> tags (keep internal #refs)
        .replace(/href\s*=\s*["'](?!#)[^"']*["']/gi, '')
        // Remove data URIs with HTML content
        .replace(/href\s*=\s*["']data:text\/html[^"']*["']/gi, '')
        .replace(/src\s*=\s*["']data:text\/html[^"']*["']/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove import statements in style
        .replace(/@import/gi, '')
    );
  }
}
