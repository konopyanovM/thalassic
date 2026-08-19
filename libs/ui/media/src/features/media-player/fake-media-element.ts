import { TimeRange } from './media-player.types';

/**
 * Stand-in for `HTMLMediaElement` in unit tests: jsdom implements no media
 * playback, so specs drive this fake's properties and fire its events, and the
 * controller under test observes them exactly as it would a real element.
 */
export class FakeMediaElement extends EventTarget {
  public currentTime = 0;
  public duration = NaN;
  public volume = 1;
  public muted = false;
  public playbackRate = 1;
  public src = '';
  public paused = true;
  public error: MediaError | null = null;
  public readyState = 0;

  private _bufferedRanges: TimeRange[] = [];

  public readonly textTracks = Object.assign(new EventTarget(), {
    length: 0,
  }) as unknown as TextTrackList;

  public get buffered(): TimeRanges {
    const ranges = this._bufferedRanges;
    return {
      length: ranges.length,
      start: (index: number) => ranges[index].start,
      end: (index: number) => ranges[index].end,
    } as TimeRanges;
  }

  public setBuffered(ranges: TimeRange[]): void {
    this._bufferedRanges = ranges;
  }

  /** Appends a fake `TextTrack` and fires the `change` event the controller listens for. */
  public addTextTrack(track: {
    kind: TextTrackKind;
    id: string;
    label: string;
    language: string;
    mode: TextTrackMode;
  }): void {
    const list = this.textTracks as unknown as Record<number, TextTrack> & { length: number };
    list[list.length] = track as unknown as TextTrack;
    list.length += 1;
    this.textTracks.dispatchEvent(new Event('change'));
  }

  public play(): Promise<void> {
    this.paused = false;
    this.fire('play');
    return Promise.resolve();
  }

  public pause(): void {
    this.paused = true;
    this.fire('pause');
  }

  public fire(type: string): void {
    this.dispatchEvent(new Event(type));
  }
}
