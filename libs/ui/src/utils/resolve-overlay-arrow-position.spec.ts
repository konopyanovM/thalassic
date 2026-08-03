import { OVERLAY_POSITION_MAP } from '../constants';
import { resolveOverlayArrowPosition } from './resolve-overlay-arrow-position';

describe('resolveOverlayArrowPosition', () => {
  it('points down from the bottom edge for an overlay above its origin', () => {
    expect(resolveOverlayArrowPosition(OVERLAY_POSITION_MAP.top)).toEqual({
      side: 'bottom',
      alignment: 'center',
    });
  });

  it('points up from the top edge for an overlay below its origin', () => {
    expect(resolveOverlayArrowPosition(OVERLAY_POSITION_MAP.bottom)).toEqual({
      side: 'top',
      alignment: 'center',
    });
  });

  it('keeps the arrow at the pinned end of an edge-aligned overlay', () => {
    expect(resolveOverlayArrowPosition(OVERLAY_POSITION_MAP['top-start'])).toEqual({
      side: 'bottom',
      alignment: 'start',
    });
    expect(resolveOverlayArrowPosition(OVERLAY_POSITION_MAP['bottom-end'])).toEqual({
      side: 'top',
      alignment: 'end',
    });
  });

  it('points from the inline edge facing the origin for an overlay beside it', () => {
    expect(resolveOverlayArrowPosition(OVERLAY_POSITION_MAP.right)).toEqual({
      side: 'start',
      alignment: 'center',
    });
    expect(resolveOverlayArrowPosition(OVERLAY_POSITION_MAP.left)).toEqual({
      side: 'end',
      alignment: 'center',
    });
  });

  it('reads the block anchoring of a side overlay as an alignment along that edge', () => {
    expect(resolveOverlayArrowPosition(OVERLAY_POSITION_MAP['right-start'])).toEqual({
      side: 'start',
      alignment: 'start',
    });
    expect(resolveOverlayArrowPosition(OVERLAY_POSITION_MAP['left-end'])).toEqual({
      side: 'end',
      alignment: 'end',
    });
  });

  it('prefers the block edge for a corner position, which touches its origin on both axes', () => {
    expect(resolveOverlayArrowPosition(OVERLAY_POSITION_MAP['top-left'])).toEqual({
      side: 'bottom',
      alignment: 'end',
    });
  });

  it('resolves to null when the overlay covers its origin instead of sitting outside it', () => {
    const covering = {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
    } as const;

    expect(resolveOverlayArrowPosition(covering)).toBeNull();
  });
});
