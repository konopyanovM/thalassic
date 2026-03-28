import { afterNextRender, Directive, ElementRef, inject, OnDestroy, output } from '@angular/core';

@Directive({
  selector: '[tlsResizeObserver]',
})
export class ResizeObserverDirective implements OnDestroy {
  private _elementRef = inject(ElementRef);

  private _resizeObserver: ResizeObserver | null = null;

  public resizeChange = output<ResizeObserverEntry>();

  constructor() {
    afterNextRender(() => {
      const elementRef = this._elementRef;
      if (elementRef) {
        this._resizeObserver = new ResizeObserver(entries => {
          const entry = entries[0];
          this.resizeChange.emit(entry);
        });
        this._resizeObserver.observe(elementRef.nativeElement);
      } else {
        console.error("Couldn't initialize ResizeObserver: elementRef is null");
      }
    });
  }

  ngOnDestroy(): void {
    if (this._resizeObserver) this._resizeObserver.disconnect();
  }
}
