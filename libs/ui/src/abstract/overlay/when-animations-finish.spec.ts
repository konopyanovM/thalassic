import { describe, expect, it, vi } from 'vitest';
import { whenAnimationsFinish } from './when-animations-finish';

// A stand-in for a Web Animations `Animation`, settled from the test.
function fakeAnimation(endTime = 250) {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const finished = new Promise<void>((resolveFinished, rejectFinished) => {
    resolve = resolveFinished;
    reject = rejectFinished;
  });
  const animation = {
    finished,
    playState: 'running',
    effect: { getComputedTiming: () => ({ endTime }) },
  } as unknown as Animation;

  return { animation, finish: () => resolve(), cancel: () => reject(new DOMException('', 'AbortError')) };
}

function elementWith(animations: Animation[]): Element {
  const element = document.createElement('div');
  element.getAnimations = vi.fn(() => animations);
  return element;
}

describe('whenAnimationsFinish', () => {
  it('waits for every running animation, however long it lasts', async () => {
    const short = fakeAnimation(100);
    const long = fakeAnimation(5000);
    const done = vi.fn();

    void whenAnimationsFinish(elementWith([short.animation, long.animation])).then(done);

    short.finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();

    long.finish();
    await vi.waitFor(() => expect(done).toHaveBeenCalled());
  });

  it('settles when an animation is cancelled, as when its element is torn down', async () => {
    const leave = fakeAnimation();
    const done = vi.fn();

    void whenAnimationsFinish(elementWith([leave.animation])).then(done);
    leave.cancel();

    await vi.waitFor(() => expect(done).toHaveBeenCalled());
  });

  it('does not wait on an animation that never ends', async () => {
    const spinner = fakeAnimation(Infinity);

    await expect(whenAnimationsFinish(elementWith([spinner.animation]))).resolves.toBeUndefined();
  });

  it('does not wait on a paused animation', async () => {
    const scrubbed = fakeAnimation();
    Object.defineProperty(scrubbed.animation, 'playState', { value: 'paused' });

    await expect(whenAnimationsFinish(elementWith([scrubbed.animation]))).resolves.toBeUndefined();
  });

  it('settles at once where nothing is animating', async () => {
    await expect(whenAnimationsFinish(elementWith([]))).resolves.toBeUndefined();
  });

  it('settles at once where the Web Animations API is missing', async () => {
    const element = document.createElement('div');
    Object.defineProperty(element, 'getAnimations', { value: undefined });

    await expect(whenAnimationsFinish(element)).resolves.toBeUndefined();
  });

  it('reads animations inside the element when asked to', () => {
    const element = elementWith([]);

    void whenAnimationsFinish(element, { subtree: true });

    expect(element.getAnimations).toHaveBeenCalledWith({ subtree: true });
  });
});
