import { DRAG_DISMISS_RATIO, SWIPE_DEFAULT_MIN_VELOCITY } from '@thalassic/core';
import { describe, expect, it } from 'vitest';
import { resolveDetent } from './resolve-detent';

const heights = [80, 400, 800];
const flick = SWIPE_DEFAULT_MIN_VELOCITY;

describe('resolveDetent', () => {
  it('steps one detent up on a flick toward larger, however short the drag', () => {
    expect(resolveDetent(heights, 0, 90, flick)).toBe(1);
  });

  it('never skips a detent on a flick, however far the drag got', () => {
    expect(resolveDetent(heights, 0, 790, flick)).toBe(1);
  });

  it('steps one detent down on a flick toward smaller', () => {
    expect(resolveDetent(heights, 2, 780, -flick)).toBe(1);
  });

  it('stays put on a flick past the end of the list', () => {
    expect(resolveDetent(heights, 2, 790, flick)).toBe(2);
    expect(resolveDetent(heights, 0, 70, -flick)).toBe(0);
  });

  it('keeps the start detent while a slow drag is short of the ratio toward its neighbour', () => {
    const shy = 80 + (400 - 80) * DRAG_DISMISS_RATIO - 1;
    expect(resolveDetent(heights, 0, shy, 0)).toBe(0);
  });

  it('moves to the neighbour once a slow drag reaches the ratio', () => {
    const atRatio = 80 + (400 - 80) * DRAG_DISMISS_RATIO;
    expect(resolveDetent(heights, 0, atRatio, 0)).toBe(1);
  });

  it('lands on the nearest detent when a slow drag passes the neighbour', () => {
    expect(resolveDetent(heights, 0, 650, 0)).toBe(2);
    expect(resolveDetent(heights, 0, 550, 0)).toBe(1);
  });

  it('applies the ratio toward smaller as well', () => {
    const shy = 800 - (800 - 400) * DRAG_DISMISS_RATIO + 1;
    expect(resolveDetent(heights, 2, shy, 0)).toBe(2);
    expect(resolveDetent(heights, 2, 550, 0)).toBe(1);
  });

  it('lets distance decide under a velocity below the flick minimum', () => {
    expect(resolveDetent(heights, 0, 650, flick / 2)).toBe(2);
    expect(resolveDetent(heights, 0, 90, -flick / 2)).toBe(0);
  });

  it('returns the start detent when released where it began, and for a single detent', () => {
    expect(resolveDetent(heights, 1, 400, 0)).toBe(1);
    expect(resolveDetent([300], 0, 250, -flick)).toBe(0);
    expect(resolveDetent([300], 0, 350, 0)).toBe(0);
  });

  it("gives a tie to the farther detent, as every boundary resolves in the drag's favour", () => {
    expect(resolveDetent(heights, 0, 600, 0)).toBe(2);
  });
});
