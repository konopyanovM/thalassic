import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SafeHtml } from '@angular/platform-browser';
import { IconService } from './icon.service';

@Component({
  selector: 'tls-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {
  private _iconService = inject(IconService);

  public iconSrc: InputSignal<string> = input.required<string>();
  public alt = input<string>('');
  public allowedSources: InputSignal<string[]> = input<string[]>([]);

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
