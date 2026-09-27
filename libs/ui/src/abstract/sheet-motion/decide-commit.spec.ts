import { DRAG_DISMISS_RATIO, SWIPE_DEFAULT_MIN_VELOCITY } from '@thalassic/core';
import { describe, expect, it } from 'vitest';
import { decideCommit } from './decide-commit';

describe('decideCommit', () => {
  it('commits on a flick toward the commit direction however short the drag', () => {
    expect(decideCommit(SWIPE_DEFAULT_MIN_VELOCITY, 0.05)).toBe(true);
  });

  it('counts a velocity exactly at the minimum as a flick', () => {
    expect(decideCommit(SWIPE_DEFAULT_MIN_VELOCITY, 0)).toBe(true);
  });

  it('declines on a flick away from the commit direction however far the drag got', () => {
    expect(decideCommit(-SWIPE_DEFAULT_MIN_VELOCITY, 0.95)).toBe(false);
  });

  it('commits a slow drag once it reaches the ratio', () => {
    expect(decideCommit(0, DRAG_DISMISS_RATIO)).toBe(true);
  });

  it('declines a slow drag short of the ratio', () => {
    expect(decideCommit(0, DRAG_DISMISS_RATIO - 0.01)).toBe(false);
  });

  it('lets distance decide under a velocity below the flick minimum either way', () => {
    const slow = SWIPE_DEFAULT_MIN_VELOCITY / 2;
    expect(decideCommit(slow, DRAG_DISMISS_RATIO)).toBe(true);
    expect(decideCommit(-slow, DRAG_DISMISS_RATIO)).toBe(true);
    expect(decideCommit(slow, 0.1)).toBe(false);
  });
});
