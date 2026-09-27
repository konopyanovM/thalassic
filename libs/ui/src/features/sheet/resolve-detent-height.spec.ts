import { describe, expect, it } from 'vitest';
import { resolveDetentHeight } from './resolve-detent-height';
import { SheetMeasures } from './sheet.types';

const measures: SheetMeasures = {
  header: 72,
  content: 500,
  viewport: 800,
  length: css => (css === '20rem' ? 320 : 0),
};

describe('resolveDetentHeight', () => {
  it('resolves header to the header height', () => {
    expect(resolveDetentHeight('header', measures)).toBe(72);
  });

  it('resolves content to the natural height, capped at the viewport', () => {
    expect(resolveDetentHeight('content', measures)).toBe(500);
    expect(resolveDetentHeight('content', { ...measures, content: 1200 })).toBe(800);
  });

  it('resolves a percentage against the viewport', () => {
    expect(resolveDetentHeight('50%', measures)).toBe(400);
    expect(resolveDetentHeight('12.5%', measures)).toBe(100);
  });

  it('resolves any other string as a CSS length, capped at the viewport', () => {
    expect(resolveDetentHeight('20rem', measures)).toBe(320);
    expect(resolveDetentHeight('20rem', { ...measures, viewport: 300 })).toBe(300);
  });
});
