import { Component, input, InputSignal, Signal, TemplateRef, viewChild } from '@angular/core';

// A declarative content holder: the host element itself is never rendered. `tls-carousel`
// reads the captured template and renders it inside its own slide wrapper, which carries
// the slide's ARIA semantics and sizing.
@Component({
  selector: 'tls-carousel-slide',
  templateUrl: './carousel-slide.html',
})
export class CarouselSlide {
  // Inputs
  /** Accessible name for the slide; falls back to a localized "n of count" position label. */
  public readonly label: InputSignal<string | undefined> = input<string | undefined>(undefined);

  // State
  public readonly contentTemplateRef: Signal<TemplateRef<unknown>> =
    viewChild.required<TemplateRef<unknown>>('slideContent');
}
