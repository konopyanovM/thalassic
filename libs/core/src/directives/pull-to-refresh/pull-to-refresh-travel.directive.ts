import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { PullToRefreshDirective } from './pull-to-refresh.directive';

/**
 * Carries the travel of the enclosing `tlsPullToRefresh` on its own element.
 *
 * `--tls-pull-distance` does not inherit, so an element inside the pulled
 * container that moves or draws by the travel has no value to read. Marked with
 * this, it is written the same value as the container on every frame of a pull
 * and can use `var(--tls-pull-distance)` as if it were the container itself.
 * Each element that reads the travel needs the mark of its own, a marked
 * element's children included.
 */
@Directive({
  selector: '[tlsPullToRefreshTravel]',
})
export class PullToRefreshTravelDirective {
  constructor() {
    const pullToRefresh = inject(PullToRefreshDirective);
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    pullToRefresh.publishTravelTo(element);
    inject(DestroyRef).onDestroy(() => pullToRefresh.stopPublishingTravelTo(element));
  }
}
