import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { map, Observable, shareReplay, throwError } from 'rxjs';

// Elements removed from fetched SVG markup: script execution, nested browsing
// contexts, and foreignObject (which can embed arbitrary HTML).
const DISALLOWED_ELEMENTS = ['script', 'foreignobject', 'iframe', 'object', 'embed', 'link', 'meta'];

// Attribute URLs must be same-document references (`#id`); anything else —
// external resources, `javascript:`, `data:` — is stripped.
const URL_ATTRIBUTES = ['href', 'xlink:href', 'src'];

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

  public sanitizeSvg(svg: string): SafeHtml {
    return this._sanitizeSvg(svg);
  }

  // Private methods
  private _isUrlAllowed(url: string, allowedSource: string[]): boolean {
    return allowedSource.some(source => url.startsWith(source));
  }

  private _sanitizeSvg(svg: string): SafeHtml {
    const safeSvg = this._makeSafe(svg);
    return this._sanitizer.bypassSecurityTrustHtml(safeSvg);
  }

  /**
   * Sanitizes SVG markup by parsing it into a DOM tree and stripping dangerous
   * nodes and attributes, so obfuscated markup (unquoted attributes, entity
   * tricks) cannot slip through the way it could with pattern matching on the
   * raw text. The cleaned tree is serialized back to markup.
   *
   * Without a DOM parser (server-side rendering), the markup is dropped rather
   * than passed through unsanitized; the icon renders once the browser takes
   * over.
   */
  private _makeSafe(svg: string): string {
    if (typeof DOMParser === 'undefined') return '';

    const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
    if (parsed.querySelector('parsererror')) return '';

    const root = parsed.documentElement;
    this._sanitizeElement(root);
    return new XMLSerializer().serializeToString(root);
  }

  private _sanitizeElement(element: Element): void {
    // Snapshot: children are removed while iterating.
    for (const child of Array.from(element.children)) {
      if (DISALLOWED_ELEMENTS.includes(child.localName.toLowerCase())) {
        child.remove();
        continue;
      }
      this._sanitizeElement(child);
    }

    for (const attribute of Array.from(element.attributes)) {
      if (this._isAttributeDisallowed(attribute.name, attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    }

    // `<style>` text can pull external resources; keep local rules only.
    if (element.localName.toLowerCase() === 'style' && element.textContent) {
      element.textContent = element.textContent
        .replace(/@import[^;]*;?/gi, '')
        .replace(/url\s*\(\s*(?!\s*["']?#)[^)]*\)/gi, 'none');
    }
  }

  private _isAttributeDisallowed(name: string, value: string): boolean {
    const attributeName = name.toLowerCase();

    // Event handlers (onclick, onload, …) regardless of quoting or casing.
    if (attributeName.startsWith('on')) return true;

    // URL-bearing attributes may only reference into the same document.
    if (URL_ATTRIBUTES.includes(attributeName)) return !value.trim().startsWith('#');

    // Inline style may not pull external resources.
    if (attributeName === 'style') return /url\s*\(\s*(?!\s*["']?#)/i.test(value) || /@import/i.test(value);

    return false;
  }
}
