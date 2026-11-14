import { afterRenderEffect, computed, inject, signal } from '@angular/core';
import {
  SLIDING_INDICATOR_ATTRIBUTE,
  SLIDING_INDICATOR_BOX_PROPERTIES,
  SLIDING_INDICATOR_PLACED,
  SLIDING_INDICATOR_TRAVELLING,
} from './sliding-indicator.constants';
import { SLIDING_INDICATOR_CONFIG } from './sliding-indicator.token';
import { SlidingIndicatorMeasurement, SlidingIndicatorOptions } from './sliding-indicator.types';

/**
 * Keeps one indicator on the chosen item of a set — the pill of a segmented
 * control, the fill of a list's selected row — so that choosing another sends
 * it travelling there instead of vanishing from one item and appearing on the
 * next. The indicator itself is drawn by the theme's `sliding-indicator` mixin
 * on the container; this writes where it goes.
 *
 * A position cannot be read from the selection: it is wherever the layout put
 * the chosen item. So the item is measured after each render that could have
 * moved it, and again whenever the container or one of its children changes
 * size — a container resized, a font that loaded late, a label that changed
 * length. The measure is taken in offsets from the container rather than in
 * viewport coordinates, which any transform on an ancestor scales and shifts —
 * a panel animating open, say — with nothing to report when it ends.
 *
 * Only the move to an item newly chosen is animated. An indicator following
 * its item as the layout around it changes is moved at once, where an
 * animated one would trail behind it.
 *
 * Along an axis the configuration leaves still, nothing is measured or
 * written, and each item goes on marking itself.
 *
 * Call it where injection is available — a constructor or a field initializer.
 *
 * @example
 * // Day | Week | Month, "Week" chosen: the indicator is placed on it.
 * //   container: data-sliding-indicator="placed", --tls-sliding-indicator-x: 60px …
 * // "Month" is chosen:
 * //   container: data-sliding-indicator="travelling", …-x: 115px   // animated
 * // the container is then resized, moving "Month":
 * //   container: data-sliding-indicator="placed", …-x: 140px       // at once
 * // every option is deselected:
 * //   container: attribute and properties removed                  // items mark themselves
 */
export function slidingIndicator(options: SlidingIndicatorOptions): void {
  const config = inject(SLIDING_INDICATOR_CONFIG);

  /** Bumped whenever the container or one of its children changes size. */
  const layout = signal(0);

  /** The container and item an indicator is to be kept on, wherever one applies. */
  const subject = computed(() => {
    if (!config[options.orientation()]) return null;

    const container = options.container();
    const target = options.target();
    if (!container || !target) return null;

    return { container, target };
  });

  /** The container the indicator was last written to, the item it was on, and its box there. */
  let placed: SlidingIndicatorMeasurement | null = null;

  afterRenderEffect({
    earlyRead: (): SlidingIndicatorMeasurement | null => {
      layout();

      const current = subject();
      if (!current) return null;

      const { container, target } = current;
      return {
        container,
        target,
        box: {
          x: target.offsetLeft,
          y: target.offsetTop,
          width: target.offsetWidth,
          height: target.offsetHeight,
        },
      };
    },
    write: measurement => {
      const measured = measurement();
      const previous = placed;

      if (previous && (!measured || measured.container !== previous.container)) {
        previous.container.removeAttribute(SLIDING_INDICATOR_ATTRIBUTE);
        for (const [, property] of SLIDING_INDICATOR_BOX_PROPERTIES) previous.container.style.removeProperty(property);
      }

      placed = measured;
      if (!measured) return;

      const sameContainer = previous !== null && previous.container === measured.container;
      const sameTarget = sameContainer && previous.target === measured.target;
      const sameBox =
        sameContainer && SLIDING_INDICATOR_BOX_PROPERTIES.every(([side]) => previous.box[side] === measured.box[side]);
      // A report of a size that turns out the same leaves an indicator on its
      // way alone, rather than cutting its move short.
      if (sameTarget && sameBox) return;

      for (const [side, property] of SLIDING_INDICATOR_BOX_PROPERTIES) {
        measured.container.style.setProperty(property, `${measured.box[side]}px`);
      }
      measured.container.setAttribute(
        SLIDING_INDICATOR_ATTRIBUTE,
        sameContainer && !sameTarget ? SLIDING_INDICATOR_TRAVELLING : SLIDING_INDICATOR_PLACED,
      );
    },
  });

  /** The container an indicator is shown on, whichever of its items is chosen. */
  const observed = computed(() => {
    const current = subject();
    return current ? current.container : null;
  });

  afterRenderEffect(onCleanup => {
    const container = observed();
    // A document that lays nothing out — a unit test's — has no sizes to
    // report and offers no observer of them.
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => layout.update(count => count + 1));
    observer.observe(container);
    for (const child of Array.from(container.children)) observer.observe(child);
    onCleanup(() => observer.disconnect());
  });
}
