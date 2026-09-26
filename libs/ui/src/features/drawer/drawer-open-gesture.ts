import { Renderer2 } from '@angular/core';
import { whenAnimationsFinish } from '../../abstract/overlay';
import { panelKeyframe, sharedKeyframe } from './drawer-origin-slide';
import { DrawerOffset, DrawerSharedPair, DrawerSlideTiming } from './drawer.types';

/**
 * A drawer opened under the finger: the panel, its shared elements and the
 * backdrop follow the drag from where the panel stands displaced to where it
 * rests, and on release settle the rest of the way — open, or back where they
 * started. The entrance is played as a scrubbed animation, so any point along
 * the drag is exactly the frame the slide would show there.
 */
export class DrawerOpenGesture {
  // Paused animations whose current time the drag sets; linear, so the panel
  // moves with the finger one to one.
  private readonly _scrubs: Animation[];
  private readonly _distance: number;
  // Share of the way open, 0 to 1.
  private _progress = 0;

  constructor(
    private readonly _panel: HTMLElement,
    private readonly _offset: DrawerOffset,
    private readonly _pairs: DrawerSharedPair[],
    private readonly _backdrop: HTMLElement | null,
    private readonly _renderer: Renderer2,
    private readonly _timing: DrawerSlideTiming,
  ) {
    this._distance = Math.hypot(_offset.x, _offset.y);

    const scrub: KeyframeAnimationOptions = { duration: 1, easing: 'linear', fill: 'both' };
    this._scrubs = [
      _panel.animate([panelKeyframe(_offset, 1), panelKeyframe(_offset, 0)], scrub),
      ..._pairs.map(pair =>
        pair.element.animate([sharedKeyframe(pair, 1), sharedKeyframe(pair, 0)], scrub),
      ),
    ];
    for (const animation of this._scrubs) animation.pause();

    // The backdrop's own transition would trail the finger; it tracks the drag
    // directly until release.
    if (_backdrop !== null) {
      _renderer.setStyle(_backdrop, 'transition', 'none');
      _renderer.setStyle(_backdrop, 'opacity', '0');
    }
  }

  /** Share of the way open the panel has been dragged, 0 to 1. */
  public get progress(): number {
    return this._progress;
  }

  /** Moves everything to where `travel` px of drag toward open puts it. */
  public follow(travel: number): void {
    this._progress =
      this._distance > 0 ? Math.min(1, Math.max(0, travel / this._distance)) : 1;

    for (const animation of this._scrubs) animation.currentTime = this._progress;
    if (this._backdrop !== null) {
      this._renderer.setStyle(this._backdrop, 'opacity', `${this._progress}`);
    }
  }

  /**
   * Settles the rest of the way, open or back where the drag began, over the
   * share of the slide that is left, then calls `done`. Settling closed holds
   * its end, so the panel stays put until the overlay is disposed.
   */
  public settle(open: boolean, done: () => void): void {
    const from = 1 - this._progress;
    const to = open ? 0 : 1;
    const timing: KeyframeAnimationOptions = {
      duration: this._timing.duration * Math.abs(to - from),
      easing: this._timing.easing,
      fill: open ? 'none' : 'forwards',
    };

    // The settles start in the same frame the scrubs are dropped, from exactly
    // where the scrubs left each element, so nothing jumps.
    for (const animation of this._scrubs) animation.cancel();
    this._panel.animate([panelKeyframe(this._offset, from), panelKeyframe(this._offset, to)], timing);
    for (const pair of this._pairs) {
      pair.element.animate([sharedKeyframe(pair, from), sharedKeyframe(pair, to)], timing);
    }

    if (this._backdrop !== null) {
      this._renderer.removeStyle(this._backdrop, 'transition');
      this._renderer.setStyle(this._backdrop, 'opacity', open ? '1' : '0');
    }

    void whenAnimationsFinish(this._panel).then(() => {
      // Once open, the backdrop is the stylesheet's again.
      if (open && this._backdrop !== null) this._renderer.removeStyle(this._backdrop, 'opacity');
      done();
    });
  }
}
