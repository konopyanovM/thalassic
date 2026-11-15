import { resolvePeekWeeks } from './resolve-peek-weeks';

describe('resolvePeekWeeks', () => {
  it('gives one count to both edges', () => {
    expect(resolvePeekWeeks(1)).toEqual({ before: 1, after: 1 });
    expect(resolvePeekWeeks(0)).toEqual({ before: 0, after: 0 });
  });

  it('keeps a count given for each edge', () => {
    expect(resolvePeekWeeks({ before: 1, after: 0 })).toEqual({ before: 1, after: 0 });
    expect(resolvePeekWeeks({ before: 0, after: 2 })).toEqual({ before: 0, after: 2 });
  });

  it('settles a count that is no whole number of weeks on one that is', () => {
    expect(resolvePeekWeeks(1.8)).toEqual({ before: 1, after: 1 });
    expect(resolvePeekWeeks(-2)).toEqual({ before: 0, after: 0 });
    expect(resolvePeekWeeks(Number.NaN)).toEqual({ before: 0, after: 0 });
    expect(resolvePeekWeeks({ before: -2, after: 1.5 })).toEqual({ before: 0, after: 1 });
  });
});
