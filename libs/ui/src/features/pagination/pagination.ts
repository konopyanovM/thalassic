import { booleanAttribute, Component, computed, inject, input, model } from '@angular/core';
import { PAGINATION_CONFIG } from './pagination.token';
import { paginationItem, paginationSize } from './pagination.types';

@Component({
  selector: 'tls-pagination',
  templateUrl: './pagination.html',
  host: { '[class]': 'classes()' },
})
export class Pagination {
  private readonly _config = inject(PAGINATION_CONFIG);

  public readonly value = model<number>(1);
  public readonly pageSize = input<number>(this._config.pageSize);
  public readonly total = input<number>(0);
  public readonly size = input<paginationSize>(this._config.size);
  public readonly boundaries = input<number>(this._config.boundaries);
  public readonly siblings = input<number>(this._config.siblings);
  public readonly showFirstButton = input<boolean, unknown>(this._config.showFirstButton, { transform: booleanAttribute });
  public readonly showLastButton = input<boolean, unknown>(this._config.showLastButton, { transform: booleanAttribute });

  protected readonly pageCount = computed(() => Math.ceil(this.total() / this.pageSize()));

  protected readonly visiblePages = computed(() =>
    this._buildPages(this.pageCount(), this.value(), this.siblings(), this.boundaries()),
  );

  protected readonly classes = computed(() => ['tls-pagination', `tls-pagination--${this.size()}`]);

  // Protected methods
  protected setPage(page: number): void {
    this.value.set(page);
  }

  protected firstPage(): void {
    this.value.set(1);
  }

  protected prevPage(): void {
    this.value.update(page => page - 1);
  }

  protected nextPage(): void {
    this.value.update(page => page + 1);
  }

  protected lastPage(): void {
    this.value.set(this.pageCount());
  }

  // Private methods
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
