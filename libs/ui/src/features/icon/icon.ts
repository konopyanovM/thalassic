import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, input, Signal, Type } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SafeHtml } from '@angular/platform-browser';
import { of } from 'rxjs';
import { IconRegistry } from './icon-registry.service';
import { iconRenderer } from './icon-renderer';
import { IconService } from './icon.service';
import { ICON_CONFIG } from './icon.token';
import { systemIcon } from './system-icon';

@Component({
  selector: 'tls-icon',
  imports: [NgComponentOutlet],
  templateUrl: './icon.html',
  host: { class: 'tls-icon' },
})
export class Icon {
  // Injections
  private readonly _iconService = inject(IconService);
  private readonly _iconRegistry = inject(IconRegistry);
  private readonly _config = inject(ICON_CONFIG);

  // Inputs
  /** A semantic icon from the registry — overridable via `provideThalassicIcons`. */
  public name = input<systemIcon>();
  /** A URL to an SVG or image for arbitrary content icons. Ignored when `name` is set. */
  public iconSrc = input<string>();
  public alt = input<string>('');
  public allowedSources = input<string[]>(this._config.allowedSources);

  // Computed
  private readonly _renderer = computed<iconRenderer | undefined>(() => {
    const name = this.name();
    if (!name) return undefined;
    return this._iconRegistry.resolve(name);
  });

  protected readonly registryComponent = computed<Type<unknown> | null>(() => {
    const renderer = this._renderer();
    if (!renderer || typeof renderer === 'string') return null;
    return renderer;
  });

  protected readonly registrySvg = computed<SafeHtml | null>(() => {
    const renderer = this._renderer();
    if (typeof renderer !== 'string') return null;
    return this._iconService.sanitizeSvg(renderer);
  });

  protected readonly isSvgSrc = computed<boolean>(() => {
    const src = this.iconSrc();
    if (!src) return false;
    return src.endsWith('.svg');
  });

  private readonly _svgContentResource = rxResource({
    defaultValue: '' as SafeHtml,
    params: () => ({
      iconSrc: this.iconSrc(),
      name: this.name(),
      allowedSources: this.allowedSources(),
    }),
    stream: ({ params }) => {
      if (params.name || !params.iconSrc) return of<SafeHtml>('');
      return this._iconService.getSvgContent(params.iconSrc, params.allowedSources);
    },
  });

  // Accessors
  get svgContent(): Signal<SafeHtml> {
    return this._svgContentResource.value.asReadonly();
  }
}
