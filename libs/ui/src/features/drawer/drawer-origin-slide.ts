import {
  DRAWER_ORIGIN_TOLERANCE,
  DRAWER_SHARED_ATTRIBUTE,
  DRAWER_SLIDE_DURATION_TOKEN,
  DRAWER_SLIDE_ENTER_EASING_TOKEN,
  DRAWER_SLIDE_LEAVE_EASING_TOKEN,
} from './drawer.constants';
import { DrawerOffset, DrawerSharedPair, drawerSide, DrawerSlideTiming } from './drawer.types';

/**
 * How far the panel stands back from its resting place while only the origin's
 * part of it shows — its inner edge on the origin's inner edge — or null when
 * the panel cannot slide out of the origin: one that is gone, has no size, or
 * lies outside the panel. Sliding from there reads as the origin lifting into
 * the panel only when the panel covers it — a sheet opened from its own lip —
 * so anything else keeps the plain slide.
 *
 * Read the panel without a transform on it: the box measured is where it rests.
 */
export function measureOriginOffset(
  panel: HTMLElement,
  origin: HTMLElement,
  side: drawerSide,
  isRtl: boolean,
): DrawerOffset | null {
  if (!origin.isConnected) return null;

  const originBox = origin.getBoundingClientRect();
  const panelBox = panel.getBoundingClientRect();
  if (originBox.width === 0 || originBox.height === 0) return null;

  const outside =
    originBox.top < panelBox.top - DRAWER_ORIGIN_TOLERANCE ||
    originBox.right > panelBox.right + DRAWER_ORIGIN_TOLERANCE ||
    originBox.bottom > panelBox.bottom + DRAWER_ORIGIN_TOLERANCE ||
    originBox.left < panelBox.left - DRAWER_ORIGIN_TOLERANCE;
  if (outside) return null;

  switch (side) {
    case 'bottom':
      return { x: 0, y: originBox.top - panelBox.top };
    case 'top':
      return { x: 0, y: originBox.bottom - panelBox.bottom };
    case 'start':
    case 'end':
      return {
        x: pinnedLeft(side, isRtl)
          ? originBox.right - panelBox.right
          : originBox.left - panelBox.left,
        y: 0,
      };
  }
}

/** How far the panel stands back when it is wholly off-screen, past its pinned edge. */
export function offscreenOffset(panel: HTMLElement, side: drawerSide, isRtl: boolean): DrawerOffset {
  const panelBox = panel.getBoundingClientRect();
  switch (side) {
    case 'bottom':
      return { x: 0, y: panelBox.height };
    case 'top':
      return { x: 0, y: -panelBox.height };
    case 'start':
    case 'end':
      return { x: pinnedLeft(side, isRtl) ? -panelBox.width : panelBox.width, y: 0 };
  }
}

/**
 * The slide's timing in one direction, from the theme's motion tokens as the
 * panel resolves them: easing out on the way in, in on the way out.
 */
export function readSlideTiming(panel: HTMLElement, direction: 'enter' | 'leave'): DrawerSlideTiming {
  const style = getComputedStyle(panel);
  const duration = style.getPropertyValue(DRAWER_SLIDE_DURATION_TOKEN).trim();
  const easingToken =
    direction === 'enter' ? DRAWER_SLIDE_ENTER_EASING_TOKEN : DRAWER_SLIDE_LEAVE_EASING_TOKEN;
  const easing = style.getPropertyValue(easingToken).trim();

  return {
    duration: toMilliseconds(duration),
    easing: easing || 'ease',
  };
}

/**
 * Each element in the panel paired with one in the origin by their shared key,
 * with what it takes to lay it over its partner while the panel stands at
 * `offset` — its own transform on top of the panel's, so the two together land
 * it there. Measure before anything moves: panel and elements must be at rest.
 */
export function measureSharedPairs(
  panel: HTMLElement,
  origin: HTMLElement,
  offset: DrawerOffset,
): DrawerSharedPair[] {
  const selector = `[${DRAWER_SHARED_ATTRIBUTE}]`;
  const partners = new Map<string, Element>();
  for (const element of Array.from(origin.querySelectorAll(selector))) {
    const key = element.getAttribute(DRAWER_SHARED_ATTRIBUTE);
    if (key !== null) partners.set(key, element);
  }

  return Array.from(panel.querySelectorAll<HTMLElement>(selector)).flatMap(
    (element): DrawerSharedPair[] => {
      const key = element.getAttribute(DRAWER_SHARED_ATTRIBUTE);
      const partner = key === null ? undefined : partners.get(key);
      if (partner === undefined) return [];

      const from = partner.getBoundingClientRect();
      const to = element.getBoundingClientRect();
      if (to.width === 0 || to.height === 0) return [];

      return [
        {
          element,
          x: from.left - (to.left + offset.x),
          y: from.top - (to.top + offset.y),
          // Scaled by type size rather than box size: the two boxes are laid
          // out by different containers, and only the text in them has to match.
          scale: fontSizeOf(partner) / fontSizeOf(element) || 1,
        },
      ];
    },
  );
}

/**
 * The panel's keyframe with `share` of its displacement left: 1 where it stands
 * over the origin (or off-screen), 0 at rest.
 */
export function panelKeyframe(offset: DrawerOffset, share: number): Keyframe {
  return { transform: `translate(${offset.x * share}px, ${offset.y * share}px)` };
}

/** A shared element's keyframe with `share` of the way back to its partner left. */
export function sharedKeyframe(pair: DrawerSharedPair, share: number): Keyframe {
  const scale = 1 + (pair.scale - 1) * share;
  return {
    transform: `translate(${pair.x * share}px, ${pair.y * share}px) scale(${scale})`,
    transformOrigin: 'top left',
  };
}

/**
 * Slides the panel in from where the origin stands, carrying each shared
 * element across from its partner, and returns the animations so a close
 * arriving mid-slide can play them back. Nothing is held once they end, so
 * the transform is free for a later drag.
 */
export function slideFromOrigin(
  panel: HTMLElement,
  offset: DrawerOffset,
  pairs: DrawerSharedPair[],
  timing: DrawerSlideTiming,
): Animation[] {
  return [
    panel.animate([panelKeyframe(offset, 1), panelKeyframe(offset, 0)], timing),
    ...pairs.map(pair =>
      pair.element.animate([sharedKeyframe(pair, 1), sharedKeyframe(pair, 0)], timing),
    ),
  ];
}

/**
 * Slides the panel back until only the origin's part of it shows, over the
 * origin itself, carrying each shared element back to its partner. The end is
 * held, so nothing jumps back in the moment between the slide ending and the
 * overlay being disposed.
 */
export function slideToOrigin(
  panel: HTMLElement,
  offset: DrawerOffset,
  pairs: DrawerSharedPair[],
  timing: DrawerSlideTiming,
): void {
  const held = { ...timing, fill: 'forwards' as const };
  panel.animate([panelKeyframe(offset, 0), panelKeyframe(offset, 1)], held);
  for (const pair of pairs) {
    pair.element.animate([sharedKeyframe(pair, 0), sharedKeyframe(pair, 1)], held);
  }
}

// Which physical edge a logical side pins to.
function pinnedLeft(side: 'start' | 'end', isRtl: boolean): boolean {
  return (side === 'start') !== isRtl;
}

function fontSizeOf(element: Element): number {
  return parseFloat(getComputedStyle(element).fontSize);
}

// A CSS time (`250ms`, `0.25s`) as milliseconds; 0 for anything unreadable,
// which plays the slide as a jump rather than failing to open or close.
function toMilliseconds(time: string): number {
  const value = parseFloat(time);
  if (Number.isNaN(value)) return 0;

  return time.endsWith('ms') ? value : value * 1000;
}
