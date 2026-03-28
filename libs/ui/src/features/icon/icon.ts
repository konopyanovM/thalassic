import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SafeHtml } from '@angular/platform-browser';
import { IconService } from './icon.service';
import { ICON_CONFIG } from './icon.token';

@Component({
  selector: 'tls-icon',
  imports: [],
  templateUrl: './icon.html',
  host: { class: 'tls-icon' },
})
export class Icon {
  // Injections
  private _iconService = inject(IconService);
  private _config = inject(ICON_CONFIG);

  // Inputs
  public iconSrc: InputSignal<string> = input.required<string>();
  public alt = input<string>('');
  public allowedSources: InputSignal<string[]> = input<string[]>(this._config.allowedSources);

  protected isSvg: Signal<boolean> = computed(() => {
    return this.iconSrc().endsWith('.svg');
  });

  private _svgContentResource = rxResource({
    defaultValue: '',
    params: () => ({
      iconSrc: this.iconSrc(),
      allowedSources: this.allowedSources(),
    }),
    stream: params =>
      this._iconService.getSvgContent(params.params.iconSrc, params.params.allowedSources),
  });

  // Accessors
  get svgContent(): Signal<SafeHtml> {
    return this._svgContentResource.value.asReadonly();
  }
}
