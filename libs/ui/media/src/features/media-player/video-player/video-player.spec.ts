import { Directionality } from '@angular/cdk/bidi';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MediaCaptionSource } from '../media-player.types';
import { MediaController } from '../media-controller';
import { patchTextTracksEventTarget } from '../text-tracks-event-target.spec-helper';
import { VideoPlayer } from './video-player';

@Component({
  imports: [VideoPlayer],
  template: '<tls-video-player [source]="source()" [captions]="captions" />',
})
class VideoPlayerHost {
  public readonly source = signal('movie.mp4');
  protected readonly captions: MediaCaptionSource[] = [
    { src: 'en.vtt', srclang: 'en', label: 'English', default: true },
  ];
}

let restoreTextTracks: () => void;

// jsdom implements no media playback: HTMLMediaElement.prototype.play logs a
// "not implemented" warning and returns undefined rather than a Promise,
// which breaks MediaController.togglePlay's `.catch` on the result. Stub it
// with a resolved Promise for the duration of this file, standing in for a
// real browser's playback promise.
let originalPlay: typeof HTMLMediaElement.prototype.play;

beforeAll(() => {
  restoreTextTracks = patchTextTracksEventTarget().restore;
  originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = () => Promise.resolve();
});

afterAll(() => {
  restoreTextTracks();
  HTMLMediaElement.prototype.play = originalPlay;
});

const setup = async (): Promise<ComponentFixture<VideoPlayerHost>> => {
  const fixture = TestBed.createComponent(VideoPlayerHost);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
};

describe('VideoPlayer', () => {
  it('renders track elements from the captions input', async () => {
    const fixture = await setup();
    const tracks = fixture.nativeElement.querySelectorAll('track');

    expect(tracks.length).toBe(1);
    expect(tracks[0].getAttribute('srclang')).toBe('en');
    expect(tracks[0].hasAttribute('default')).toBe(true);
  });

  it('maps player-level keys to controller calls', async () => {
    const fixture = await setup();
    const controller = fixture.debugElement
      .query(By.directive(VideoPlayer))
      .injector.get(MediaController);
    const seekBy = vi.spyOn(controller, 'seekBy');
    const toggle = vi.spyOn(controller, 'togglePlay');
    const root = fixture.nativeElement.querySelector('tls-video-player') as HTMLElement;

    root.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(toggle).toHaveBeenCalled();
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(seekBy).toHaveBeenCalledWith(5);
  });

  it('shows the error panel with a retry button in the error state', async () => {
    const fixture = await setup();
    const videoElement = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    Object.defineProperty(videoElement, 'error', { value: { code: 4 }, configurable: true });

    videoElement.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    const retry = fixture.nativeElement.querySelector('.error__retry');
    expect(retry).toBeTruthy();
  });

  it('keeps controls visible while paused even after the hide delay', async () => {
    vi.useFakeTimers();
    const fixture = await setup();
    const root = fixture.nativeElement.querySelector('tls-video-player') as HTMLElement;

    root.dispatchEvent(new PointerEvent('pointermove'));
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();
    const controls = root.querySelector('.controls');
    expect(controls).not.toBeNull();
    if (controls === null) throw new Error('controls not found');
    expect(controls.classList.contains('controls--hidden')).toBe(false);
    vi.useRealTimers();
  });

  it('arms the auto-hide timer once playback starts, with no pointer movement needed', async () => {
    const fixture = await setup();
    const root = fixture.nativeElement.querySelector('tls-video-player') as HTMLElement;
    const videoElement = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    // Focus inside the host would keep controls visible regardless of the timer.
    root.blur();
    vi.useFakeTimers();

    videoElement.dispatchEvent(new Event('play'));
    videoElement.dispatchEvent(new Event('playing'));
    fixture.detectChanges();
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();

    const controls = root.querySelector('.controls');
    expect(controls).not.toBeNull();
    if (controls === null) throw new Error('controls not found');
    expect(controls.classList.contains('controls--hidden')).toBe(true);
    vi.useRealTimers();
  });

  it('shows an accumulating seek-feedback badge that clears after its window', async () => {
    const fixture = await setup();
    const root = fixture.nativeElement.querySelector('tls-video-player') as HTMLElement;
    const videoElement = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    // Seeks clamp into [0, duration]; give the timeline room to accumulate.
    Object.defineProperty(videoElement, 'duration', { value: 300, configurable: true });
    videoElement.dispatchEvent(new Event('durationchange'));
    vi.useFakeTimers();

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    const badge = root.querySelector('.seek-feedback');
    expect(badge).not.toBeNull();
    if (badge === null) throw new Error('badge not found');
    expect(badge.textContent).toContain('+10s');

    // An opposite-direction press restarts the count from its own step.
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    const restartedBadge = root.querySelector('.seek-feedback');
    if (restartedBadge === null) throw new Error('badge not found after direction change');
    expect(restartedBadge.textContent).toContain('−5s');

    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(root.querySelector('.seek-feedback')).toBeNull();
    vi.useRealTimers();
  });

  it('reaches the media element when the source input changes after attach', async () => {
    const fixture = await setup();
    const videoElement = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    expect(videoElement.src).toContain('movie.mp4');

    fixture.componentInstance.source.set('other-movie.mp4');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(videoElement.src).toContain('other-movie.mp4');
  });

  it('flips ArrowRight to a backward seek under RTL', async () => {
    TestBed.inject(Directionality).valueSignal.set('rtl');
    const fixture = await setup();
    const controller = fixture.debugElement
      .query(By.directive(VideoPlayer))
      .injector.get(MediaController);
    const seekBy = vi.spyOn(controller, 'seekBy');
    const root = fixture.nativeElement.querySelector('tls-video-player') as HTMLElement;

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(seekBy).toHaveBeenCalledWith(-5);
  });
});
