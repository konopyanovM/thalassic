import { touchActionClaimsAxis } from './touch-action-claims-axis';

describe('touchActionClaimsAxis', () => {
  it('claims both axes for none', () => {
    expect(touchActionClaimsAxis('none', 'x')).toBe(true);
    expect(touchActionClaimsAxis('none', 'y')).toBe(true);
  });

  it('claims nothing for auto and manipulation', () => {
    expect(touchActionClaimsAxis('auto', 'y')).toBe(false);
    expect(touchActionClaimsAxis('manipulation', 'x')).toBe(false);
  });

  it('claims the axis its pan token withholds', () => {
    expect(touchActionClaimsAxis('pan-x', 'y')).toBe(true);
    expect(touchActionClaimsAxis('pan-x', 'x')).toBe(false);
    expect(touchActionClaimsAxis('pan-y', 'x')).toBe(true);
    expect(touchActionClaimsAxis('pan-y', 'y')).toBe(false);
  });

  it('honors single-direction pan tokens as allowing their axis', () => {
    expect(touchActionClaimsAxis('pan-up', 'y')).toBe(false);
    expect(touchActionClaimsAxis('pan-left pinch-zoom', 'x')).toBe(false);
    expect(touchActionClaimsAxis('pan-left pinch-zoom', 'y')).toBe(true);
  });

  it('reads combined values per axis', () => {
    expect(touchActionClaimsAxis('pan-x pan-y', 'x')).toBe(false);
    expect(touchActionClaimsAxis('pan-x pan-y', 'y')).toBe(false);
    expect(touchActionClaimsAxis('pinch-zoom', 'y')).toBe(true);
  });

  it('treats an unresolved empty or absent value as the initial auto', () => {
    expect(touchActionClaimsAxis('', 'y')).toBe(false);
    expect(touchActionClaimsAxis(undefined, 'y')).toBe(false);
  });
});
