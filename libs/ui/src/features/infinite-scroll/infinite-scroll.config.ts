/** Text rendered by the trigger and the end-of-collection notice, overridable for localization. */
export interface InfiniteScrollLabels {
  /** Announced while a page is in flight. */
  loading: string;
  /** Rendered and announced once the collection is exhausted. */
  complete: string;
  /** Label of the button that loads the next page. */
  loadMore: string;
}

export interface InfiniteScrollConfig {
  /**
   * Distance ahead of the scroll edge at which a load starts, in pixels. The trigger counts
   * as visible while it is still this far outside the scroll container, so the next page is
   * requested before the reader arrives at the end of the current one.
   */
  rootMargin: number;
  /**
   * Consecutive automatic loads allowed before the manual trigger takes over; activating the
   * trigger clears the count. A collection that keeps growing on its own puts whatever
   * follows it — a footer, the next landmark — permanently out of reach, so the limit is what
   * hands control back. `0` removes it and should be paired with another way out.
   */
  autoLoadLimit: number;
  labels: InfiniteScrollLabels;
}

export const DEFAULT_INFINITE_SCROLL_CONFIG: InfiniteScrollConfig = {
  rootMargin: 200,
  autoLoadLimit: 3,
  labels: {
    loading: 'Loading more items',
    complete: 'No more items',
    loadMore: 'Load more',
  },
};
