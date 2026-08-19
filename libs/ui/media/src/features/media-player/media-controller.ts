import { computed, DestroyRef, inject, Injectable, signal, Signal } from '@angular/core';
import { MediaPlayerConfig } from './media-player.config';
import { MEDIA_PLAYER_CONFIG } from './media-player.token';
import { MediaTextTrack, mediaState, TimeRange } from './media-player.types';
import { MEDIA_SOURCE_ENGINE } from './media-source-engine';

/**
 * Headless playback state over one `HTMLMediaElement`. Provided per player
 * instance; the single place in the feature that touches the element. All
 * signals are written exclusively from element events (plus one eager sync at
 * attach, since a cached or autoplaying source can already be past
 * `loadedmetadata` and will not re-fire it).
 */
@Injectable()
export class MediaController {
  // Injections
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _engine = inject(MEDIA_SOURCE_ENGINE, { optional: true });
  private readonly _config: MediaPlayerConfig = inject(MEDIA_PLAYER_CONFIG);

  // State
  private _media: HTMLMediaElement | null = null;
  private _detachRegistered = false;
  private readonly _playing = signal(false);
  private readonly _currentTime = signal(0);
  private readonly _duration = signal(0);
  private readonly _buffered = signal<TimeRange[]>([]);
  private readonly _volume = signal(1);
  private readonly _muted = signal(false);
  private readonly _rate = signal(1);
  private readonly _state = signal<mediaState>('idle');
  private readonly _error = signal<MediaError | null>(null);
  private readonly _textTracks = signal<MediaTextTrack[]>([]);
  private readonly _scrubbing = signal(false);
  private readonly _scrubTime = signal(0);

  public readonly playing: Signal<boolean> = this._playing.asReadonly();
  public readonly currentTime: Signal<number> = computed(() =>
    this._scrubbing() ? this._scrubTime() : this._currentTime(),
  );
  public readonly duration: Signal<number> = this._duration.asReadonly();
  public readonly buffered: Signal<TimeRange[]> = this._buffered.asReadonly();
  public readonly volume: Signal<number> = this._volume.asReadonly();
  public readonly muted: Signal<boolean> = this._muted.asReadonly();
  public readonly rate: Signal<number> = this._rate.asReadonly();
  public readonly state: Signal<mediaState> = this._state.asReadonly();
  public readonly error: Signal<MediaError | null> = this._error.asReadonly();
  public readonly textTracks: Signal<MediaTextTrack[]> = this._textTracks.asReadonly();

  // Public methods
  public attach(media: HTMLMediaElement): void {
    this._media = media;
    this._listen(media, 'play', () => this._playing.set(true));
    this._listen(media, 'pause', () => this._playing.set(false));
    this._listen(media, 'ended', () => {
      this._playing.set(false);
      this._state.set('ended');
    });
    this._listen(media, 'timeupdate', () => {
      if (!this._scrubbing()) this._syncTime(media);
    });
    this._listen(media, 'seeked', () => {
      if (!this._scrubbing()) this._syncTime(media);
    });
    this._listen(media, 'durationchange', () => this._syncDuration(media));
    this._listen(media, 'loadedmetadata', () => {
      this._syncDuration(media);
      this._syncBuffered(media);
      this._syncTextTracks(media);
    });
    this._listen(media, 'progress', () => this._syncBuffered(media));
    this._listen(media, 'volumechange', () => {
      this._volume.set(media.volume);
      this._muted.set(media.muted);
    });
    this._listen(media, 'ratechange', () => this._rate.set(media.playbackRate));
    this._listen(media, 'waiting', () => this._state.set('loading'));
    this._listen(media, 'canplay', () => {
      if (!this._playing()) this._state.set('ready');
    });
    this._listen(media, 'playing', () => this._state.set('playing'));
    this._listen(media, 'emptied', () => this._state.set('idle'));
    this._listen(media, 'error', () => {
      this._error.set(media.error);
      this._state.set('error');
    });
    this._listen(media.textTracks, 'change', () => this._syncTextTracks(media));

    this._syncInitial(media);
    this._registerMediaSession();
  }

  public play(): Promise<void> {
    const media = this._requireMedia();
    return media.play();
  }

  public pause(): void {
    this._requireMedia().pause();
  }

  public togglePlay(): void {
    if (this._playing()) {
      this.pause();
      return;
    }
    // A rejected play (autoplay policy) leaves the poster and play affordance
    // in place; there is nothing further to do here.
    this.play().catch(() => undefined);
  }

  public seek(seconds: number): void {
    const media = this._requireMedia();
    const clampedSeconds = this._clampTime(seconds);
    media.currentTime = clampedSeconds;
    // Optimistic signal update: the element completes a seek asynchronously
    // (`seeked` can arrive much later on a network source), and waiting for it
    // would snap the playhead back to the stale time in between — visible as a
    // flicker when a scrub commits.
    this._currentTime.set(clampedSeconds);
  }

  public seekBy(delta: number): void {
    this.seek(this.currentTime() + delta);
  }

  public beginScrub(): void {
    this._scrubTime.set(this._currentTime());
    this._scrubbing.set(true);
  }

  public scrubTo(seconds: number): void {
    this._scrubTime.set(this._clampTime(seconds));
  }

  public endScrub(): void {
    this._scrubbing.set(false);
    this.seek(this._scrubTime());
  }

  public setVolume(volume: number): void {
    const media = this._requireMedia();
    media.volume = Math.min(Math.max(volume, 0), 1);
    if (media.volume > 0) media.muted = false;
  }

  public toggleMute(): void {
    const media = this._requireMedia();
    media.muted = !media.muted;
  }

  public setRate(rate: number): void {
    this._requireMedia().playbackRate = rate;
  }

  public setSource(source: string): void {
    const media = this._requireMedia();
    const engine = this._engine;
    if (engine && engine.canPlay(source)) {
      // A previously attached engine must release its own resources before a
      // new source takes over the element.
      if (this._detachRegistered) engine.detach();
      engine.attach(media, source);
      if (!this._detachRegistered) {
        this._detachRegistered = true;
        this._destroyRef.onDestroy(() => engine.detach());
      }
      return;
    }
    media.src = source;
  }

  public selectTextTrack(id: string | null): void {
    const media = this._requireMedia();
    for (let index = 0; index < media.textTracks.length; index++) {
      const track = media.textTracks[index];
      if (track.kind !== 'subtitles' && track.kind !== 'captions') continue;
      const trackId = track.id !== '' ? track.id : `${track.language}-${index}`;
      track.mode = trackId === id ? 'showing' : 'disabled';
    }
    this._syncTextTracks(media);
  }

  public setMetadata(metadata: {
    title?: string;
    artist?: string;
    artwork?: { src: string }[];
  }): void {
    if (typeof navigator === 'undefined') return;
    if (!('mediaSession' in navigator) || !navigator.mediaSession) return;
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
  }

  // Private methods
  private _requireMedia(): HTMLMediaElement {
    if (!this._media) throw new Error('MediaController is not attached to a media element.');
    return this._media;
  }

  private _clampTime(seconds: number): number {
    return Math.min(Math.max(seconds, 0), this._duration());
  }

  private _registerMediaSession(): void {
    if (typeof navigator === 'undefined') return;
    if (!('mediaSession' in navigator) || !navigator.mediaSession) return;
    const session = navigator.mediaSession;
    const actions: MediaSessionAction[] = ['play', 'pause', 'seekbackward', 'seekforward', 'seekto'];
    session.setActionHandler('play', () => this.togglePlay());
    session.setActionHandler('pause', () => this.pause());
    session.setActionHandler('seekbackward', () => this.seekBy(-this._config.seekStep));
    session.setActionHandler('seekforward', () => this.seekBy(this._config.seekStep));
    session.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) this.seek(details.seekTime);
    });
    this._destroyRef.onDestroy(() => {
      for (const action of actions) session.setActionHandler(action, null);
    });
  }

  private _listen(target: EventTarget, type: string, handler: () => void): void {
    target.addEventListener(type, handler);
    this._destroyRef.onDestroy(() => target.removeEventListener(type, handler));
  }

  private _syncInitial(media: HTMLMediaElement): void {
    this._syncDuration(media);
    this._syncTime(media);
    this._syncBuffered(media);
    this._syncTextTracks(media);
    this._volume.set(media.volume);
    this._muted.set(media.muted);
    this._rate.set(media.playbackRate);
    if (!media.paused) {
      this._playing.set(true);
      this._state.set('playing');
    }
  }

  private _syncTime(media: HTMLMediaElement): void {
    this._currentTime.set(media.currentTime);
  }

  private _syncDuration(media: HTMLMediaElement): void {
    this._duration.set(Number.isFinite(media.duration) ? media.duration : 0);
  }

  private _syncBuffered(media: HTMLMediaElement): void {
    const ranges: TimeRange[] = [];
    for (let index = 0; index < media.buffered.length; index++) {
      ranges.push({ start: media.buffered.start(index), end: media.buffered.end(index) });
    }
    this._buffered.set(ranges);
  }

  private _syncTextTracks(media: HTMLMediaElement): void {
    const tracks: MediaTextTrack[] = [];
    for (let index = 0; index < media.textTracks.length; index++) {
      const track = media.textTracks[index];
      if (track.kind !== 'subtitles' && track.kind !== 'captions') continue;
      tracks.push({
        id: track.id !== '' ? track.id : `${track.language}-${index}`,
        label: track.label,
        language: track.language,
        active: track.mode === 'showing',
      });
    }
    this._textTracks.set(tracks);
  }
}
