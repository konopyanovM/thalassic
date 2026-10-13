import { PagingRelease, resistPagingDrag, resolvePagingStep } from './paging';

describe('resolvePagingStep', () => {
  const release = (offset: number, velocity: number): PagingRelease => ({
    offset,
    velocity,
    extent: 400,
    commitRatio: 0.3,
    flickVelocity: 0.4,
  });

  it('steps the way a drag was carried once it has covered the commit share', () => {
    expect(resolvePagingStep(release(-120, 0))).toBe(-1);
    expect(resolvePagingStep(release(120, 0))).toBe(1);
  });

  it('goes back to rest for a drag that falls short and is not flicked', () => {
    expect(resolvePagingStep(release(-119, 0.1))).toBe(0);
  });

  it('steps on a flick however short the travel', () => {
    expect(resolvePagingStep(release(-10, -0.5))).toBe(-1);
    expect(resolvePagingStep(release(10, 0.5))).toBe(1);
  });

  it('steps the way of a flick let go before anything had moved', () => {
    expect(resolvePagingStep(release(0, -0.5))).toBe(-1);
  });

  it('takes less than a pixel off rest for rest, so a hair the other way does not cancel a flick', () => {
    expect(resolvePagingStep(release(0.5, -0.5))).toBe(-1);
  });

  it('goes back to rest when flicked against the way it was carried, however far that was', () => {
    expect(resolvePagingStep(release(-300, 0.5))).toBe(0);
    expect(resolvePagingStep(release(300, -0.5))).toBe(0);
  });

  it('does not step from rest without a flick', () => {
    expect(resolvePagingStep(release(0, 0))).toBe(0);
  });

  it('does not judge distance against a page with no extent', () => {
    expect(resolvePagingStep({ ...release(-500, 0), extent: 0 })).toBe(0);
  });
});

describe('resistPagingDrag', () => {
  it('follows the drag where a page lies that way', () => {
    expect(resistPagingDrag(-90, true, 3)).toBe(-90);
  });

  it('gives one part in the resistance where none does', () => {
    expect(resistPagingDrag(-90, false, 3)).toBe(-30);
  });
});
