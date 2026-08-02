import { booleanAttribute, Component, computed, effect, inject, input, model } from '@angular/core';
import { controlSize } from '../../types';
import { Icon } from '../icon';
import { PaginationLabels } from './pagination.config';
import { PAGINATION_CONFIG } from './pagination.token';
import { paginationItem } from './pagination.types';

@Component({
  selector: 'tls-pagination',
  imports: [Icon],
  templateUrl: './pagination.html',
  host: {
    role: 'navigation',
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabelledby() ? null : ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
  },
})
export class Pagination {
  private readonly _config = inject(PAGINATION_CONFIG);

  public readonly value = model<number>(1);

  /** Accessible name for the pagination navigation landmark. */
  public readonly ariaLabel = input<string>('Pagination');
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  public readonly pageSize = input<number>(this._config.pageSize);
  public readonly total = input<number>(0);
  public readonly size = input<controlSize>(this._config.size);
  public readonly boundaries = input<number>(this._config.boundaries);
  public readonly siblings = input<number>(this._config.siblings);
  public readonly showFirstButton = input<boolean, unknown>(this._config.showFirstButton, {
    transform: booleanAttribute,
  });
  public readonly showLastButton = input<boolean, unknown>(this._config.showLastButton, {
    transform: booleanAttribute,
  });

  protected readonly labels: PaginationLabels = this._config.labels;

  protected readonly pageCount = computed(() => Math.ceil(this.total() / this.pageSize()));

  /** Last valid page; at least 1 so the current page never leaves the 1-based range. */
  protected readonly lastValidPage = computed(() => Math.max(1, this.pageCount()));

  protected readonly visiblePages = computed(() =>
    this._buildPages(this.pageCount(), this.value(), this.siblings(), this.boundaries()),
  );

  protected readonly classes = computed(() => ['tls-pagination', `tls-pagination--${this.size()}`]);

  constructor() {
    // Normalize an out-of-range page — a shrinking `total`, or an external set
    // (e.g. a query-param restore) beyond the last page — back into range. While
    // `total` is 0 the range is unknown (it usually arrives async), so a
    // restored page is left alone rather than clamped against nothing.
    effect(() => {
      if (this.pageCount() < 1) return;

      const clamped = this._clamp(this.value());
      if (clamped !== this.value()) this.value.set(clamped);
    });
  }

  // Protected methods
  protected setPage(page: number): void {
    this.value.set(this._clamp(page));
  }

  protected firstPage(): void {
    this.value.set(1);
  }

  protected prevPage(): void {
    this.value.update(page => Math.max(1, page - 1));
  }

  protected nextPage(): void {
    this.value.update(page => Math.min(this.lastValidPage(), page + 1));
  }

  protected lastPage(): void {
    this.value.set(this.lastValidPage());
  }

  // Private methods
  private _clamp(page: number): number {
    return Math.min(Math.max(1, page), this.lastValidPage());
  }

  /** Returns an inclusive array of integers from start to end. Returns [] if end < start. */
  private _range(start: number, end: number): number[] {
    const length = end - start + 1;
    return length > 0 ? Array.from({ length }, (_, i) => start + i) : [];
  }

  /** Computes the visible page items, inserting 'gap' where ellipsis should appear based on boundaries and siblings. */
  private _buildPages(
    total: number,
    current: number,
    siblings: number,
    boundaries: number,
  ): paginationItem[] {
    if (total <= 0) return [];

    // + 3: current page + two potential gap placeholders (left and right ellipsis)
    if (siblings * 2 + boundaries * 2 + 3 >= total) return this._range(1, total);

    const leftSiblingIndex = Math.max(current - siblings, boundaries + 1);
    const rightSiblingIndex = Math.min(current + siblings, total - boundaries);

    const showLeftGap = leftSiblingIndex > boundaries + 2;
    const showRightGap = rightSiblingIndex < total - boundaries - 1;

    const startPages = this._range(1, boundaries);
    const endPages = this._range(total - boundaries + 1, total);

    if (!showLeftGap && showRightGap) {
      // Expand left side to compensate for the missing left gap, keeping total item count stable
      return [...this._range(1, boundaries + siblings * 2 + 2), 'gap', ...endPages];
    }

    if (showLeftGap && !showRightGap) {
      // Expand right side to compensate for the missing right gap, keeping total item count stable
      return [...startPages, 'gap', ...this._range(total - boundaries - siblings * 2 - 1, total)];
    }

    return [
      ...startPages,
      'gap',
      ...this._range(leftSiblingIndex, rightSiblingIndex),
      'gap',
      ...endPages,
    ];
  }
}
