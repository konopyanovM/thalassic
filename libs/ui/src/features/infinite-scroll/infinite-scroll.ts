import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  InputSignal,
  InputSignalWithTransform,
  numberAttribute,
  output,
  OutputEmitterRef,
  PLATFORM_ID,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { Button } from '../button';
import { Loader } from '../loader';
import { InfiniteScrollConfig, InfiniteScrollLabels } from './infinite-scroll.config';
import { INFINITE_SCROLL_CONFIG } from './infinite-scroll.token';
import { infiniteScrollState } from './infinite-scroll.types';

/**
 * End-of-collection trigger that asks for the next page as the reader approaches it. The
 * host is the sentinel: it is placed immediately after the collection and watched with an
 * `IntersectionObserver`, so `loadMore` fires once it comes within `rootMargin` of the
 * scroll edge. It renders the loading, end-of-collection and manual-trigger states of that
 * cycle, and nothing else — the collection above it stays entirely the consumer's.
 *
 * ```html
 * @for (article of articles(); track article.id) {
 *   <article>…</article>
 * }
 *
 * <tls-infinite-scroll
 *   [loading]="loading()"
 *   [complete]="loadedEverything()"
 *   (loadMore)="loadNextPage()"
 * />
 * ```
 *
 * The component owns no data, so `loading` is how it learns what became of a request:
 * raising it suspends the watch, and lowering it re-checks the sentinel and asks for one
 * more page while the collection is still too short to fill the container. Until `loading`
 * moves, the request already made stands, and the sentinel sitting in view cannot turn into
 * a second one — so a consumer that never raises `loading` at all gets exactly one request
 * each time the sentinel is scrolled into view.
 *
 * Content that grows without end leaves anything below it unreachable, so the automatic
 * loads are rationed: after `autoLoadLimit` of them in a row the component stops watching
 * and renders a button, and the allowance is renewed each time that button is used. The
 * three states each accept replacement content —
 * `[tlsInfiniteScrollLoading]`, `[tlsInfiniteScrollComplete]`, `[tlsInfiniteScrollTrigger]`
 * — projected in place of the loader, the end notice and the button:
 *
 * ```html
 * <tls-infinite-scroll [loading]="loading()" (loadMore)="loadNextPage()">
 *   <tls-skeleton tlsInfiniteScrollLoading height="64px" />
 * </tls-infinite-scroll>
 * ```
 *
 * Visibility is clipped by every scrolling ancestor, so a collection inside a panel triggers
 * without configuration — but the head start does not come for free with it: `rootMargin`
 * expands the root's box and nothing else, and the root is the viewport until one is named.
 * Left unset inside a panel, the next page is therefore requested only as the sentinel
 * reaches the panel's edge; pass that panel as `root` to get the margin back.
 *
 * The end notice is announced from `labels.complete`, whatever stands in the slot, so
 * replacement content belongs with a label that says the same thing.
 */
@Component({
  selector: 'tls-infinite-scroll',
  imports: [Button, Loader],
  templateUrl: './infinite-scroll.html',
  styleUrl: './infinite-scroll.scss',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class InfiniteScroll {
  // Injections
  private readonly _config: InfiniteScrollConfig = inject(INFINITE_SCROLL_CONFIG);
  private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  // Inputs
  /**
   * Whether a page is in flight. While it is raised nothing is watched and nothing is
   * emitted; lowering it re-measures the sentinel and requests the next page when the
   * collection still has not reached past the scroll edge.
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /** Whether the collection is exhausted. Ends the cycle and renders the end notice. */
  public readonly complete: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /**
   * Suspends the whole trigger without ending it: nothing is watched, nothing is rendered,
   * and the automatic allowance is kept for when it is lifted.
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /**
   * Renders the button from the start instead of loading on approach. The scroll position
   * then never triggers a request, which is what a collection whose items are expensive to
   * render — or one a reader is likely to scroll past — should do.
   */
  public readonly manual: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /** Distance ahead of the scroll edge at which a load starts, in pixels. */
  public readonly rootMargin: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.rootMargin,
    { transform: numberAttribute },
  );

  /** Consecutive automatic loads before the button takes over; `0` removes the limit. */
  public readonly autoLoadLimit: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.autoLoadLimit,
    { transform: numberAttribute },
  );

  /**
   * Element the sentinel's visibility is measured against. Left unset that is the viewport,
   * clipped by whatever scrolling ancestors lie in between — enough to trigger inside a
   * panel, but `rootMargin` then expands the viewport's box rather than the panel's, which
   * costs the head start. Name the scrolling container to measure the margin against it.
   */
  public readonly root: InputSignal<Element | null> = input<Element | null>(null);

  // Outputs
  /**
   * Request for one more page. One request stands at a time: nothing follows it until
   * `loading` moves or the sentinel leaves view, whether it came from the scroll position
   * or from the button.
   */
  public readonly loadMore: OutputEmitterRef<void> = output<void>();

  // State
  protected readonly labels: InfiniteScrollLabels = this._config.labels;

  /** Automatic loads since the last time the button was used. */
  private readonly _automaticLoads: WritableSignal<number> = signal(0);

  /**
   * Whether a request has gone out that nothing has accounted for yet. The sentinel keeps
   * reporting itself visible after a page is asked for — an observer started while it is in
   * view says so immediately — so without this a single request would be repeated for as
   * long as it takes the collection to grow past the scroll edge. Any change to `loading`
   * settles the outstanding request: raising it is the consumer taking the request on,
   * lowering it means the page has landed.
   */
  private readonly _pending: WritableSignal<boolean> = linkedSignal({
    source: this.loading,
    computation: () => false,
  });

  // Computed
  protected readonly state: Signal<infiniteScrollState> = computed<infiniteScrollState>(() => {
    // Suspension outranks every other state: a trigger told to stand down neither watches
    // nor reports, whatever the collection is doing meanwhile.
    if (this.disabled()) return 'disabled';
    if (this.complete()) return 'complete';
    if (this.loading()) return 'loading';

    const limit = this.autoLoadLimit();
    if (this.manual() || (limit > 0 && this._automaticLoads() >= limit)) return 'manual';

    return 'idle';
  });

  /** Text of the live region: empty in every state that has nothing to report. */
  protected readonly announcement: Signal<string> = computed<string>(() => {
    const state = this.state();
    if (state === 'loading') return this.labels.loading;
    if (state === 'complete') return this.labels.complete;

    return '';
  });

  protected readonly hostClasses: Signal<string[]> = computed<string[]>(() => [
    'tls-infinite-scroll',
    `tls-infinite-scroll--${this.state()}`,
  ]);

  /**
   * Whether the sentinel is under observation. Observation outlives the point at which the
   * component stops asking for pages: a request that the consumer never reports on is
   * settled by the sentinel leaving view, which only an observer still in place can see.
   */
  private readonly _observing: Signal<boolean> = computed<boolean>(() => this.state() === 'idle');

  /** Whether a report of the sentinel in view should turn into a request. */
  private readonly _requesting: Signal<boolean> = computed<boolean>(
    () => this._observing() && !this._pending(),
  );

  /**
   * Margin as the observer takes it. A margin that does not resolve to a length is rejected
   * by the observer's constructor, so an unusable input falls back to the configured one
   * rather than leaving the collection with no trigger at all.
   */
  private readonly _resolvedRootMargin: Signal<string> = computed<string>(() => {
    const margin = this.rootMargin();

    return `${Number.isFinite(margin) ? margin : this._config.rootMargin}px`;
  });

  constructor() {
    effect(onCleanup => {
      if (!this._isBrowser) return;
      if (!this._observing()) return;

      const observer = new IntersectionObserver(
        entries => {
          if (entries[entries.length - 1].isIntersecting) {
            this._loadAutomatically();

            return;
          }

          // The sentinel out of view is the end of whatever was asked for while it was in
          // view: the collection now reaches past the scroll edge, however it got there.
          this._pending.set(false);
        },
        { root: this.root(), rootMargin: this._resolvedRootMargin() },
      );

      // An observer reports the sentinel's current visibility as soon as it starts, so
      // re-arming after a page has arrived is what continues a collection too short to
      // reach past the scroll edge — no separate catch-up pass is needed.
      observer.observe(this._elementRef.nativeElement);
      onCleanup(() => observer.disconnect());
    });
  }

  // Public methods
  /**
   * Requests the next page as the button does, renewing the automatic allowance. Ignored
   * while a page is in flight, once the collection is exhausted and while suspended.
   */
  public load(): void {
    const state = this.state();
    if (state !== 'idle' && state !== 'manual') return;

    this._automaticLoads.set(0);
    this._emit();
  }

  /**
   * Renews the automatic allowance. A collection that is replaced rather than extended — a
   * new query, a changed filter — starts its own run of automatic loads, which this
   * restores. It emits nothing itself, but it does put the sentinel back under observation,
   * so a page is requested straight away when the shorter collection leaves it in view.
   */
  public reset(): void {
    this._automaticLoads.set(0);
  }

  // Private methods
  private _loadAutomatically(): void {
    if (!untracked(this._requesting)) return;

    this._automaticLoads.update(count => count + 1);
    this._emit();
  }

  private _emit(): void {
    this._pending.set(true);
    this.loadMore.emit();
  }
}
