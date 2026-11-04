import { OVERLAY_POSITION_MAP } from '../constants';
import { buildOverlayPositions } from './build-overlay-positions';

describe('buildOverlayPositions', () => {
  const placement = (position: { originX: string; originY: string; overlayX: string; overlayY: string }) =>
    [position.originX, position.originY, position.overlayX, position.overlayY].join(' ');

  it('falls back to the mirrored placement first, keeping the alignment', () => {
    const [preferred, fallback] = buildOverlayPositions('bottom-start', { x: 0, y: 4 });

    expect(placement(preferred)).toBe(placement(OVERLAY_POSITION_MAP['bottom-start']));
    expect(placement(fallback)).toBe(placement(OVERLAY_POSITION_MAP['top-start']));
  });

  it('mirrors a side placement across its origin', () => {
    const [, fallback] = buildOverlayPositions('right', { x: 4, y: 0 });

    expect(placement(fallback)).toBe(placement(OVERLAY_POSITION_MAP.left));
  });

  it('offers every placement exactly once', () => {
    expect(buildOverlayPositions('top-end', { x: 0, y: 4 })).toHaveLength(
      Object.keys(OVERLAY_POSITION_MAP).length,
    );
  });

  it('points the offset away from the origin on the flipped side', () => {
    const [preferred, fallback] = buildOverlayPositions('bottom-start', { x: 0, y: 4 });

    expect(preferred.offsetY).toBe(4);
    expect(fallback.offsetY).toBe(-4);
  });
});
