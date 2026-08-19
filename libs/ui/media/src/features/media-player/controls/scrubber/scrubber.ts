import { Directionality } from '@angular/cdk/bidi';
import { computed, Component, inject, Signal } from '@angular/core';
import { MediaController } from '../../media-controller';
import { MEDIA_PLAYER_CONFIG } from '../../media-player.token';

/** Formats whole seconds as `m:ss` (or `h:mm:ss` past an hour). */
export const formatMediaTime = (totalSeconds: number): string => {
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);
  const padded = (value: number): string => String(value).padStart(2, '0');
  if (hours > 0) return `${hours}:${padded(minutes)}:${padded(seconds)}`;
  return `${minutes}:${padded(seconds)}`;
};

/**
 * Playhead slider for a media player. Drives the attached {@link MediaController}'s
 * scrub lock while dragging so timeupdate events from playback do not fight the
 * thumb, and commits the seek on release.
 */
@Component({
  selector: 'tls-media-scrubber',
  templateUrl: './scrubber.html',
  styleUrl: './scrubber.scss',
  host: {
    role: 'slider',
    tabindex: '0',
    class: 'tls-media-scrubber',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'duration()',
    '[attr.aria-valuenow]': 'currentTime()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-label]': 'labels.seek',
    '[style.--tls-media-played]': 'playedFraction()',
    '[style.--tls-media-buffered]': 'bufferedFraction()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerCancel()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class MediaScrubber {
  // Injections
  private readonly _controller = inject(MediaController);
  private readonly _config = inject(MEDIA_PLAYER_CONFIG);
  private readonly _directionality = inject(Directionality);

  // State
  private _dragging = false;
  private _pointerId: number | null = null;

  protected readonly labels = this._config.labels;

  // Computed
  protected readonly duration: Signal<number> = computed(() =>
    Math.round(this._controller.duration()),
  );
  protected readonly currentTime: Signal<number> = computed(() =>
    Math.round(this._controller.currentTime()),
  );
  protected readonly valueText: Signal<string> = computed(
    () =>
      `${formatMediaTime(this.currentTime())} ${this.labels.timeSeparator} ${formatMediaTime(this.duration())}`,
  );
  protected readonly playedFraction: Signal<number> = computed(() => {
    const duration = this._controller.duration();
    if (duration <= 0) return 0;
    return this._controller.currentTime() / duration;
  });
  protected readonly bufferedFraction: Signal<number> = computed(() => {
    const duration = this._controller.duration();
    const ranges = this._controller.buffered();
    if (duration <= 0 || ranges.length === 0) return 0;
    return ranges[ranges.length - 1].end / duration;
  });

  // Protected methods
  protected onPointerDown(event: PointerEvent): void {
    // Only the primary button starts a drag: a secondary press (context menu)
    // never delivers a matching pointerup, which would strand the scrub lock
    // and freeze the displayed playhead.
    if (event.button !== 0) return;
    this._dragging = true;
    this._pointerId = event.pointerId;
    const host = event.currentTarget as HTMLElement;
    host.setPointerCapture(event.pointerId);
    this._controller.beginScrub();
    this._controller.scrubTo(this._timeFromPointer(event, host));
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this._dragging || event.pointerId !== this._pointerId) return;
    this._controller.scrubTo(this._timeFromPointer(event, event.currentTarget as HTMLElement));
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this._dragging || event.pointerId !== this._pointerId) return;
    this._dragging = false;
    this._pointerId = null;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    this._controller.endScrub();
  }

  /**
   * Aborted pointers (touch cancellation, capture loss) must still release the
   * scrub lock or the displayed playhead freezes; the last scrubbed position is
   * committed as if the pointer had lifted there.
   */
  protected onPointerCancel(): void {
    if (!this._dragging) return;
    this._dragging = false;
    this._pointerId = null;
    this._controller.endScrub();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const step = this._config.seekStep;
    const forwardKey = this._directionality.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backwardKey = this._directionality.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forwardKey) this._controller.seekBy(step);
    else if (event.key === backwardKey) this._controller.seekBy(-step);
    else if (event.key === 'Home') this._controller.seek(0);
    else if (event.key === 'End') this._controller.seek(this._controller.duration());
    else return;
    event.preventDefault();
    event.stopPropagation();
  }

  // Private methods
  private _timeFromPointer(event: PointerEvent, host: HTMLElement): number {
    const rect = host.getBoundingClientRect();
    let fraction = (event.clientX - rect.left) / rect.width;
    if (this._directionality.value === 'rtl') fraction = 1 - fraction;
    return Math.min(Math.max(fraction, 0), 1) * this._controller.duration();
  }
}
