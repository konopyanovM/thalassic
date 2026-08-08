import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
  ExtendedScrollToOptions,
} from '@angular/cdk/scrolling';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  numberAttribute,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
  TrackByFunction,
  viewChild,
} from '@angular/core';
import { orientation, TrackBy } from '../../types';
import { resolveTrackBy } from '../../utils';
import { VIRTUAL_SCROLL_CONFIG } from './virtual-scroll.token';
import { VirtualScrollContext } from './virtual-scroll.types';

/**
 * Scroll container that renders only the items intersecting the visible window plus a
 * buffer, keeping the DOM a constant size however long the collection is. Every item
 * occupies the same fixed extent along the scroll axis, declared by `itemSize`.
 *
 * The collection arrives as the `items` input and each item is rendered through a
 * template projected under the `#item` reference:
 *
 * ```html
 * <tls-virtual-scroll [items]="rows()" [itemSize]="48" trackBy="id">
 *   <ng-template #item let-row let-index="index" let-count="count">
 *     <div class="row" role="listitem" [attr.aria-posinset]="index + 1" [attr.aria-setsize]="count">
 *       {{ row.name }}
 *     </div>
 *   </ng-template>
 * </tls-virtual-scroll>
 * ```
 *
 * ```scss
 * .row {
 *   box-sizing: border-box;
 *   height: var(--tls-virtual-scroll-item-size);
 * }
 * ```
 *
 * Because most items are absent from the DOM, assistive technology can no longer
 * derive the collection's size or an item's position from the markup. The template
 * context exposes the true `index` and `count` for exactly this reason; an item
 * carrying a role that belongs to a set should reflect them through `aria-posinset`
 * and `aria-setsize`.
 *
 * Windowing needs a bounded scroll container, so the host must have a resolved extent
 * along the scroll axis — it defaults to filling its parent, which therefore needs a
 * height of its own.
 *
 * The scroll axis follows `orientation`. When it is `horizontal` the roles of the two
 * axes swap: `itemSize` is an item's *width*, so the item template constrains
 * `width: var(--tls-virtual-scroll-item-size)` instead of `height` — and the cross-axis
 * height still has to be resolved, because the absolutely-positioned items cannot
 * drive it.
 */
@Component({
  selector: 'tls-virtual-scroll',
  imports: [CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf],
  templateUrl: './virtual-scroll.html',
  styleUrl: './virtual-scroll.scss',
  host: {
    class: 'tls-virtual-scroll',
  },
})
export class VirtualScroll<T> {
  // Injections
  private readonly _config = inject(VIRTUAL_SCROLL_CONFIG);

  // Inputs
  public readonly items: InputSignal<readonly T[]> = input.required<readonly T[]>();

  /**
   * Extent of a single item along the scroll axis, in pixels. Every offset the container
   * computes assumes it, so an item that renders to a different size drifts out of
   * place. Nothing constrains the item template, so its own styles have to honour the
   * value; it is published on the scroll container as the `--tls-virtual-scroll-item-size`
   * custom property, which an item can read (`height: var(--tls-virtual-scroll-item-size)`)
   * instead of repeating the number.
   */
  public readonly itemSize: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.itemSize,
    { transform: numberAttribute },
  );

  /**
   * Buffer kept rendered beyond the visible window, in pixels. When the rendered
   * buffer falls below this minimum, items are rendered up to `maxBufferPx` — which
   * must therefore be at least this value, or the scroll strategy throws. Raising
   * only one of the pair past the other's default breaks that invariant.
   */
  public readonly minBufferPx: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.minBufferPx,
    { transform: numberAttribute },
  );

  /** Buffer rendered when `minBufferPx` is crossed, in pixels. Must be at least `minBufferPx`. */
  public readonly maxBufferPx: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.maxBufferPx,
    { transform: numberAttribute },
  );
  public readonly orientation: InputSignal<orientation> = input<orientation>(
    this._config.orientation,
  );
  public readonly appendOnly: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.appendOnly,
    { transform: booleanAttribute },
  );
  public readonly templateCacheSize: InputSignalWithTransform<number, unknown> = input<
    number,
    unknown
  >(this._config.templateCacheSize, { transform: numberAttribute });

  /** Identity of an item, so a changed collection reuses views instead of rebuilding them. */
  public readonly trackBy: InputSignal<TrackBy<T> | undefined> = input<TrackBy<T> | undefined>(
    undefined,
  );

  /**
   * Role applied to the scroll container rather than the host, so that the items —
   * which the container owns — are described relative to it. Left unset the container
   * carries no role and the items keep whatever semantics their template gives them.
   */
  public readonly viewportRole = input<string | undefined>(undefined);

  /**
   * Id applied to the scroll container rather than the host, for the same reason as
   * `viewportRole`: a reference to the collection (`aria-controls`, `aria-owns`) has to
   * resolve to the element that owns the items. Deliberately not named `id` — a static
   * `id` attribute would land on the host and the container at once, duplicating the id.
   */
  public readonly viewportId = input<string | undefined>(undefined);

  /**
   * Reflected as `aria-multiselectable` on the scroll container, meaningful when
   * `viewportRole` names a role that supports it (a listbox holding a multiple
   * selection).
   */
  public readonly ariaMultiselectable = input<boolean | undefined>(undefined);

  /**
   * Whether the scroll container is a tab stop. A region that scrolls has to be
   * operable from the keyboard, so it is one by default. Turn it off only when the
   * region already offers that operability another way — items that are themselves
   * focusable, or a widget that drives the container through `scrollToIndex` from a
   * control elsewhere — since a redundant tab stop is its own obstacle.
   *
   * A tab stop should announce what it is: pair it with `viewportRole` and an
   * accessible name (`ariaLabel` / `ariaLabelledby`) so focus does not land on an
   * anonymous container.
   */
  public readonly focusable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    true,
    { transform: booleanAttribute },
  );

  /** Accessible name for the scroll container. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);
  public readonly ariaDescribedby = input<string | undefined>(undefined);

  // Outputs
  /** Index of the first item currently rendered, emitted as the window moves. */
  public readonly scrolledIndexChange: OutputEmitterRef<number> = output<number>();

  // State
  private readonly _viewport = viewChild.required(CdkVirtualScrollViewport);

  /**
   * Template rendering a single item, projected as `<ng-template #item>`. It receives
   * the item as `$implicit` alongside the positional context described on the class.
   */
  protected readonly itemTemplate =
    contentChild.required<TemplateRef<VirtualScrollContext<T>>>('item');

  // Computed
  protected readonly resolvedTrackBy: Signal<TrackByFunction<T>> = computed<TrackByFunction<T>>(
    () => resolveTrackBy(this.trackBy()),
  );

  // Public methods
  /** Scrolls the item at `index` to the leading edge of the container. */
  public scrollToIndex(index: number, behavior?: ScrollBehavior): void {
    this._viewport().scrollToIndex(index, behavior);
  }

  /**
   * Scrolls the least amount that brings the item at `index` fully into view: an item
   * beyond the trailing edge lands on that edge, one before the leading edge lands on
   * it, and an item already fully visible does not move — the behavior of
   * `scrollIntoView({ block: 'nearest' })`, which `scrollToIndex` (always pinning to
   * the leading edge) does not provide.
   */
  public scrollIndexIntoView(index: number, behavior?: ScrollBehavior): void {
    const viewport = this._viewport();
    const itemSize = this.itemSize();
    const itemStart = index * itemSize;
    // `start`/`end` name the inline axis (flipping with the layout direction), so the
    // block axis of a vertical container has to be addressed as `top`.
    const horizontal = this.orientation() === 'horizontal';
    const scrollOffset = viewport.measureScrollOffset(horizontal ? 'start' : 'top');
    const viewportSize = viewport.getViewportSize();

    let target: number;
    if (itemStart < scrollOffset) {
      target = itemStart;
    } else if (itemStart + itemSize > scrollOffset + viewportSize) {
      target = itemStart + itemSize - viewportSize;
    } else {
      return;
    }

    const options: ExtendedScrollToOptions = horizontal ? { start: target } : { top: target };
    if (behavior !== undefined) options.behavior = behavior;
    viewport.scrollTo(options);
  }

  /** Scrolls to an offset given from any edge of the container. */
  public scrollTo(options: ExtendedScrollToOptions): void {
    this._viewport().scrollTo(options);
  }

  /**
   * Re-measures the container. Its size is measured when it is created and whenever the
   * window resizes, so a container revealed inside a panel or a collapsed parent — sized
   * only after that measurement — has to ask for a fresh one.
   */
  public checkViewportSize(): void {
    this._viewport().checkViewportSize();
  }
}
