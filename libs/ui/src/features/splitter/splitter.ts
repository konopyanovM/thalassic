import { Directionality } from '@angular/cdk/bidi';
import {
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { SplitterConfig } from './splitter.config';
import { COLLAPSE_SNAP_OVERSHOOT } from './splitter.constants';
import { SPLITTER_CONFIG } from './splitter.token';
import { splitterOrientation } from './splitter.types';
import { SplitterPanel } from './splitter-panel';

interface SplitterSeam {
  index: number;
  position: number;
  valueNow: number;
  valueMin: number;
  valueMax: number;
  controls: string;
}

@Component({
  selector: 'tls-splitter',
  imports: [],
  templateUrl: './splitter.html',
  host: {
    '[class]': 'hostClasses()',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
  },
})
export class Splitter {
  // Injections
  private readonly _config: SplitterConfig = inject(SPLITTER_CONFIG);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _directionality = inject(Directionality);

  // Inputs
  public readonly orientation: InputSignal<splitterOrientation> = input<splitterOrientation>(
    this._config.orientation,
  );
  public readonly keyboardStep: InputSignal<number> = input<number>(this._config.keyboardStep);

  /** Accessible name for the group of panels and their separators. */
  public readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public readonly ariaLabelledby: InputSignal<string | undefined> = input<string | undefined>(
    undefined,
  );

  // State
  // `descendants: false` scopes the query to this splitter's own panels; without
  // it a nested `tls-splitter`'s panels would be counted here too.
  protected readonly panels: Signal<readonly SplitterPanel[]> = contentChildren(SplitterPanel, {
    descendants: false,
  });

  private readonly _activeSeam: WritableSignal<number | null> = signal<number | null>(null);

  // Transient drag bookkeeping, captured on pointer down.
  private _dragContainerSize = 0;
  private _dragStartCoordinate = 0;
  private _dragStartSize = 0;

  // Restore sizes for collapsed panels, keyed by the panel that owns them.
  private readonly _collapsedSizes = new WeakMap<SplitterPanel, number>();
  private readonly _collapsedFlags = new WeakMap<SplitterPanel, boolean>();

  // Computed
  protected readonly isHorizontal = computed(() => this.orientation() === 'horizontal');

  protected readonly ariaOrientation = computed(() =>
    this.isHorizontal() ? 'vertical' : 'horizontal',
  );

  protected readonly hostClasses = computed(() => {
    const className = 'tls-splitter';

    const array: string[] = [className];

    array.push(`${className}--${this.orientation()}`);
    if (this._activeSeam() !== null) array.push(`${className}--resizing`);

    return array;
  });

  protected readonly seams: Signal<SplitterSeam[]> = computed(() => {
    const panels = this.panels();
    if (panels.length < 2) return [];

    const sizes = panels.map(panel => panel.size() ?? 0);
    const total = sizes.reduce((sum, size) => sum + size, 0);
    if (total <= 0) return [];

    const seams: SplitterSeam[] = [];
    let cumulative = 0;

    for (let index = 0; index < panels.length - 1; index++) {
      const leading = panels[index];
      const trailing = panels[index + 1];
      const pairSum = sizes[index] + sizes[index + 1];

      // Bound the reported range by the whole pair, not just the leading
      // panel's own min/max, so it matches what a resize can actually reach.
      const valueMin = Math.round((this._lowerBound(leading, trailing, pairSum) / total) * 100);
      const valueMax = Math.round((this._upperBound(leading, trailing, pairSum) / total) * 100);
      const valueNow = Math.min(
        Math.max(Math.round((sizes[index] / total) * 100), valueMin),
        valueMax,
      );

      cumulative += sizes[index];

      seams.push({
        index,
        position: (cumulative / total) * 100,
        valueNow,
        valueMin,
        valueMax,
        controls: `${leading.id} ${trailing.id}`,
      });
    }

    return seams;
  });

  constructor() {
    // Resolve `null` panel sizes into an equal share of the remaining space,
    // then normalize the whole set to sum to 100%.
    effect(() => this._initializeSizes());

    // Reflect each panel's `collapsed` model into a size of 0, restoring the
    // previous size (from its neighbour) when it expands again.
    effect(() => this._syncCollapsedPanels());
  }

  // Protected methods
  protected onGutterPointerDown(seamIndex: number, event: PointerEvent): void {
    const panels = this.panels();
    const leading = panels[seamIndex];
    const trailing = panels[seamIndex + 1];
    if (!leading || !trailing) return;

    event.preventDefault();

    // `preventDefault` suppresses the default focus, so focus the gutter
    // explicitly — otherwise the arrow keys wouldn't work after a pointer drag.
    const gutter = event.target as HTMLElement;
    gutter.focus();

    const rect = this._elementRef.nativeElement.getBoundingClientRect();

    this._dragContainerSize = this.isHorizontal() ? rect.width : rect.height;
    this._dragStartCoordinate = this.isHorizontal() ? event.clientX : event.clientY;
    this._dragStartSize = leading.size() ?? 0;

    this._activeSeam.set(seamIndex);

    gutter.setPointerCapture(event.pointerId);
  }

  protected onGutterPointerMove(seamIndex: number, event: PointerEvent): void {
    if (this._activeSeam() !== seamIndex) return;
    if (this._dragContainerSize <= 0) return;

    const coordinate = this.isHorizontal() ? event.clientX : event.clientY;

    let deltaPixels = coordinate - this._dragStartCoordinate;
    if (this.isHorizontal() && this._isRtl()) deltaPixels = -deltaPixels;

    const deltaPercent = (deltaPixels / this._dragContainerSize) * 100;

    this._applySeamSize(seamIndex, this._dragStartSize + deltaPercent);
  }

  protected onGutterPointerUp(seamIndex: number, event: PointerEvent): void {
    if (this._activeSeam() !== seamIndex) return;

    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    this._activeSeam.set(null);
  }

  // Pointer capture is already released once the browser cancels the pointer, so
  // this only resets drag state (calling `releasePointerCapture` here can throw).
  protected onGutterPointerCancel(seamIndex: number): void {
    if (this._activeSeam() !== seamIndex) return;
    this._activeSeam.set(null);
  }

  protected onGutterKeydown(seamIndex: number, event: KeyboardEvent): void {
    const panels = this.panels();
    const leading = panels[seamIndex];
    const trailing = panels[seamIndex + 1];
    if (!leading || !trailing) return;

    const step = this.keyboardStep();
    const horizontal = this.isHorizontal();
    const rtl = this._isRtl();
    const pairSum = (leading.size() ?? 0) + (trailing.size() ?? 0);
    const current = leading.size() ?? 0;

    let desired: number;

    switch (event.key) {
      case 'ArrowLeft':
        if (!horizontal) return;
        desired = current + (rtl ? step : -step);
        break;
      case 'ArrowRight':
        if (!horizontal) return;
        desired = current + (rtl ? -step : step);
        break;
      case 'ArrowUp':
        if (horizontal) return;
        desired = current - step;
        break;
      case 'ArrowDown':
        if (horizontal) return;
        desired = current + step;
        break;
      case 'Home':
        desired = this._lowerBound(leading, trailing, pairSum);
        break;
      case 'End':
        desired = this._upperBound(leading, trailing, pairSum);
        break;
      default:
        return;
    }

    event.preventDefault();

    // Keyboard steps are discrete, so collapse/expand can't rely on the pointer
    // path's overshoot. Resolve it explicitly from the key's direction instead.
    const shrinkLeading = desired < current;
    const growLeading = desired > current;

    if (leading.collapsed() && growLeading) return this._expand(leading, trailing);
    if (trailing.collapsed() && shrinkLeading) return this._expand(trailing, leading);

    // Pushing a panel that already sits at its min further shut collapses it.
    if (leading.collapsible() && shrinkLeading && (leading.size() ?? 0) <= leading.min()) {
      return this._collapse(leading, trailing, pairSum);
    }
    if (trailing.collapsible() && growLeading && (trailing.size() ?? 0) <= trailing.min()) {
      return this._collapse(trailing, leading, pairSum);
    }

    this._applySeamSize(seamIndex, desired);
  }

  // Private methods
  private _isRtl(): boolean {
    return this._directionality.value === 'rtl';
  }

  private _lowerBound(leading: SplitterPanel, trailing: SplitterPanel, pairSum: number): number {
    return Math.max(leading.min(), pairSum - trailing.max());
  }

  private _upperBound(leading: SplitterPanel, trailing: SplitterPanel, pairSum: number): number {
    return Math.min(leading.max(), pairSum - trailing.min());
  }

  // Sets the leading panel to `desiredSize`, clamped so both panels honour their
  // min/max, and gives the remainder of the pair to the trailing panel. A
  // `collapsible` panel dragged past its `min` snaps shut instead of clamping.
  private _applySeamSize(seamIndex: number, desiredSize: number): void {
    const panels = this.panels();
    const leading = panels[seamIndex];
    const trailing = panels[seamIndex + 1];
    if (!leading || !trailing) return;

    const pairSum = (leading.size() ?? 0) + (trailing.size() ?? 0);

    if (leading.collapsible() && desiredSize < leading.min() - COLLAPSE_SNAP_OVERSHOOT) {
      this._collapse(leading, trailing, pairSum);
      return;
    }
    if (trailing.collapsible() && pairSum - desiredSize < trailing.min() - COLLAPSE_SNAP_OVERSHOOT) {
      this._collapse(trailing, leading, pairSum);
      return;
    }

    const lower = this._lowerBound(leading, trailing, pairSum);
    const upper = this._upperBound(leading, trailing, pairSum);
    if (lower > upper) return;

    const leadingSize = Math.min(Math.max(desiredSize, lower), upper);

    // A valid resize sits both panels at or above their min, so neither stays
    // collapsed — clear any collapsed state the pair still carries.
    this._setCollapsedState(leading, false);
    this._setCollapsedState(trailing, false);

    leading.size.set(leadingSize);
    trailing.size.set(pairSum - leadingSize);
  }

  // Collapses `panel` to zero, handing its space to `neighbour`. Expanding again
  // restores the panel to its `min`.
  private _collapse(panel: SplitterPanel, neighbour: SplitterPanel, pairSum: number): void {
    this._collapsedSizes.set(panel, panel.min());
    this._setCollapsedState(panel, true);
    this._setCollapsedState(neighbour, false);

    panel.size.set(0);
    neighbour.size.set(pairSum);
  }

  // Expands a collapsed `panel` back to its restore size, taking the space from
  // `neighbour`. Bounded by whatever the neighbour can actually give up.
  private _expand(panel: SplitterPanel, neighbour: SplitterPanel): void {
    const pairSum = (panel.size() ?? 0) + (neighbour.size() ?? 0);
    const restore = Math.min(this._collapsedSizes.get(panel) ?? panel.min(), pairSum);

    this._setCollapsedState(panel, false);

    panel.size.set(restore);
    neighbour.size.set(pairSum - restore);
  }

  // Updates a panel's `collapsed` model from an interactive resize. Pre-syncing
  // the flag keeps `_syncCollapsedPanels` from re-running its own size handling.
  private _setCollapsedState(panel: SplitterPanel, collapsed: boolean): void {
    if (panel.collapsed() === collapsed) return;

    this._collapsedFlags.set(panel, collapsed);
    panel.collapsed.set(collapsed);
  }

  private _initializeSizes(): void {
    const panels = this.panels();
    if (panels.length === 0) return;

    const sizes = panels.map(panel => panel.size());
    const providedTotal = sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0);
    const autoCount = sizes.filter(size => size === null).length;

    // Fully specified and already summing to 100% — nothing to resolve.
    if (autoCount === 0 && Math.round(providedTotal) === 100) return;

    untracked(() => {
      const remaining = Math.max(0, 100 - providedTotal);
      const autoShare = autoCount > 0 ? remaining / autoCount : 0;

      let resolved = sizes.map(size => (size === null ? autoShare : size));

      // Providing sizes that already exceed 100% scales the whole set down.
      const total = resolved.reduce((sum, size) => sum + size, 0);
      if (total > 0 && total !== 100) resolved = resolved.map(size => (size / total) * 100);

      panels.forEach((panel, index) => panel.size.set(resolved[index]));
    });
  }

  private _syncCollapsedPanels(): void {
    const panels = this.panels();

    for (const panel of panels) {
      const collapsed = panel.collapsed();
      const previous = this._collapsedFlags.get(panel) ?? false;
      if (collapsed === previous) continue;

      this._collapsedFlags.set(panel, collapsed);
      untracked(() => this._toggleCollapse(panel, collapsed));
    }
  }

  private _toggleCollapse(panel: SplitterPanel, collapsed: boolean): void {
    const panels = this.panels();
    const index = panels.indexOf(panel);
    const neighbour = panels[index + 1] ?? panels[index - 1];
    if (!neighbour) return;

    if (collapsed) {
      const size = panel.size() ?? 0;
      this._collapsedSizes.set(panel, size);
      panel.size.set(0);
      neighbour.size.set((neighbour.size() ?? 0) + size);
      return;
    }

    const restore = this._collapsedSizes.get(panel) ?? 0;
    const available = Math.min(restore, neighbour.size() ?? 0);
    panel.size.set(available);
    neighbour.size.set((neighbour.size() ?? 0) - available);
  }
}
