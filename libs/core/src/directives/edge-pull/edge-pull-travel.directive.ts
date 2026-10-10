import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { EdgePullDirective } from './edge-pull.directive';

/**
 * Carries the travel of the enclosing `tlsEdgePull` on its own element.
 *
 * `--tls-edge-pull-distance` does not inherit, so an element inside the pulled
 * container that moves or draws by the travel has no value to read. Marked with
 * this, it is written the same value as the container on every frame of a pull
 * and can use `var(--tls-edge-pull-distance)` as if it were the container
 * itself. Each element that reads the travel needs the mark of its own, a
 * marked element's children included.
 */
@Directive({
  selector: '[tlsEdgePullTravel]',
})
export class EdgePullTravelDirective {
  constructor() {
    const edgePull = inject(EdgePullDirective);
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    edgePull.publishTravelTo(element);
    inject(DestroyRef).onDestroy(() => edgePull.stopPublishingTravelTo(element));
  }
}
