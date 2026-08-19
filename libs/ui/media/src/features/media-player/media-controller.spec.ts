import { EnvironmentInjector, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FakeMediaElement } from './fake-media-element';
import { MediaController } from './media-controller';
import { MEDIA_SOURCE_ENGINE } from './media-source-engine';
import { DEFAULT_MEDIA_PLAYER_CONFIG } from './media-player.config';
import { MEDIA_PLAYER_CONFIG } from './media-player.token';

const createAttached = (): { controller: MediaController; media: FakeMediaElement } => {
  const media = new FakeMediaElement();
  const controller = runInInjectionContext(
    TestBed.inject(Injector),
    () => new MediaController(),
  );
  controller.attach(media as unknown as HTMLMediaElement);
  return { controller, media };
};

describe('MediaController read surface', () => {
  it('starts idle with zeroed state', () => {
    const { controller } = createAttached();
    expect(controller.state()).toBe('idle');
    expect(controller.currentTime()).toBe(0);
    expect(controller.duration()).toBe(0);
    expect(controller.playing()).toBe(false);
  });

  it('eagerly syncs state already present at attach time', () => {
    const media = new FakeMediaElement();
    media.duration = 120;
    media.currentTime = 30;
    media.paused = false;
    media.readyState = 4;
    const controller = runInInjectionContext(
      TestBed.inject(Injector),
      () => new MediaController(),
    );
    controller.attach(media as unknown as HTMLMediaElement);

    expect(controller.duration()).toBe(120);
    expect(controller.currentTime()).toBe(30);
    expect(controller.playing()).toBe(true);
  });

  it('tracks time, duration and buffered from events', () => {
    const { controller, media } = createAttached();
    media.duration = 60;
    media.fire('durationchange');
    media.currentTime = 12.5;
    media.fire('timeupdate');
    media.setBuffered([{ start: 0, end: 20 }]);
    media.fire('progress');

    expect(controller.duration()).toBe(60);
    expect(controller.currentTime()).toBe(12.5);
    expect(controller.buffered()).toEqual([{ start: 0, end: 20 }]);
  });

  it('derives the one-of-N media state', () => {
    const { controller, media } = createAttached();
    media.fire('waiting');
    expect(controller.state()).toBe('loading');
    media.fire('canplay');
    expect(controller.state()).toBe('ready');
    media.play();
    media.fire('playing');
    expect(controller.state()).toBe('playing');
    media.paused = true;
    media.fire('ended');
    expect(controller.state()).toBe('ended');
    expect(controller.playing()).toBe(false);
  });

  it('surfaces element errors', () => {
    const { controller, media } = createAttached();
    media.error = { code: 4 } as MediaError;
    media.fire('error');
    expect(controller.state()).toBe('error');
    expect(controller.error()).toEqual({ code: 4 });
  });

  it('reflects volume, mute and rate changes', () => {
    const { controller, media } = createAttached();
    media.volume = 0.4;
    media.muted = true;
    media.fire('volumechange');
    media.playbackRate = 1.5;
    media.fire('ratechange');

    expect(controller.volume()).toBe(0.4);
    expect(controller.muted()).toBe(true);
    expect(controller.rate()).toBe(1.5);
  });
});

describe('MediaController write surface', () => {
  it('clamps seeks into [0, duration]', () => {
    const { controller, media } = createAttached();
    media.duration = 100;
    media.fire('durationchange');

    controller.seek(150);
    expect(media.currentTime).toBe(100);
    controller.seek(-5);
    expect(media.currentTime).toBe(0);
    controller.seekBy(30);
    expect(media.currentTime).toBe(30);
  });

  it('holds the scrub position and ignores timeupdate while scrubbing', () => {
    const { controller, media } = createAttached();
    media.duration = 100;
    media.fire('durationchange');

    controller.beginScrub();
    controller.scrubTo(40);
    expect(controller.currentTime()).toBe(40);

    media.currentTime = 12;
    media.fire('timeupdate');
    expect(controller.currentTime()).toBe(40);

    controller.endScrub();
    expect(media.currentTime).toBe(40);
  });

  it('reports a seek target immediately, before the element confirms the seek', () => {
    const { controller, media } = createAttached();
    media.duration = 100;
    media.fire('durationchange');
    media.currentTime = 10;
    media.fire('timeupdate');

    // No `seeked`/`timeupdate` fires between the seek and the read: the signal
    // must not sit on the stale time while the element completes the seek.
    controller.seek(70);
    expect(controller.currentTime()).toBe(70);

    controller.beginScrub();
    controller.scrubTo(25);
    controller.endScrub();
    expect(controller.currentTime()).toBe(25);
  });

  it('toggles mute and clamps volume', () => {
    const { controller, media } = createAttached();
    controller.setVolume(1.5);
    expect(media.volume).toBe(1);
    controller.toggleMute();
    expect(media.muted).toBe(true);
  });

  it('sets the source directly when no engine is provided', () => {
    const { controller, media } = createAttached();
    controller.setSource('video.mp4');
    expect(media.src).toBe('video.mp4');
  });
});

describe('MediaController source engine', () => {
  it('delegates to an engine that can play the source', () => {
    const engine = {
      canPlay: vi.fn(() => true),
      attach: vi.fn(),
      detach: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: MEDIA_SOURCE_ENGINE, useValue: engine }],
    });
    const { controller, media } = createAttached();

    controller.setSource('stream.m3u8');

    expect(engine.attach).toHaveBeenCalledWith(media, 'stream.m3u8');
    expect(media.src).toBe('');
  });

  it('falls back to direct src when the engine declines', () => {
    const engine = { canPlay: vi.fn(() => false), attach: vi.fn(), detach: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: MEDIA_SOURCE_ENGINE, useValue: engine }],
    });
    const { controller, media } = createAttached();

    controller.setSource('video.mp4');

    expect(engine.attach).not.toHaveBeenCalled();
    expect(media.src).toBe('video.mp4');
  });

  it('detaches a previously attached engine before a new source re-attaches it', () => {
    const calls: string[] = [];
    const engine = {
      canPlay: vi.fn(() => true),
      attach: vi.fn(() => calls.push('attach')),
      detach: vi.fn(() => calls.push('detach')),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: MEDIA_SOURCE_ENGINE, useValue: engine }],
    });
    const { controller } = createAttached();

    controller.setSource('stream-one.m3u8');
    expect(engine.detach).not.toHaveBeenCalled();

    controller.setSource('stream-two.m3u8');

    expect(calls).toEqual(['attach', 'detach', 'attach']);
  });
});

describe('MediaController config', () => {
  it('steps media-key seeks by the configured seekStep', () => {
    const setActionHandler = vi.fn();
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaSession: { setActionHandler, metadata: null },
    });
    TestBed.configureTestingModule({
      providers: [
        { provide: MEDIA_PLAYER_CONFIG, useValue: { ...DEFAULT_MEDIA_PLAYER_CONFIG, seekStep: 30 } },
      ],
    });
    const { controller, media } = createAttached();
    media.duration = 100;
    media.fire('durationchange');

    const backward = setActionHandler.mock.calls.find((call) => call[0] === 'seekbackward');
    const forward = setActionHandler.mock.calls.find((call) => call[0] === 'seekforward');
    if (backward === undefined || forward === undefined) throw new Error('handlers not registered');

    controller.seek(50);
    media.fire('seeked'); // Syncs the controller's tracked time to the fake element's currentTime.
    forward[1]();
    expect(media.currentTime).toBe(80);
    media.fire('seeked');
    backward[1]();
    expect(media.currentTime).toBe(50);
    vi.unstubAllGlobals();
  });
});

describe('MediaController media session', () => {
  it('registers action handlers when the Media Session API exists', () => {
    const setActionHandler = vi.fn();
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaSession: { setActionHandler, metadata: null },
    });

    createAttached();

    const registered = setActionHandler.mock.calls.map((call) => call[0]);
    expect(registered).toEqual(
      expect.arrayContaining(['play', 'pause', 'seekbackward', 'seekforward', 'seekto']),
    );
    vi.unstubAllGlobals();
  });

  it('attaches without error when the API is absent', () => {
    vi.stubGlobal('navigator', { ...navigator, mediaSession: undefined });
    expect(() => createAttached()).not.toThrow();
    vi.unstubAllGlobals();
  });

  it('resets every registered action handler to null on destroy', () => {
    const setActionHandler = vi.fn();
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaSession: { setActionHandler, metadata: null },
    });
    const injector = Injector.create({
      providers: [MediaController],
      parent: TestBed.inject(Injector),
    }) as EnvironmentInjector;
    const controller = runInInjectionContext(injector, () => injector.get(MediaController));
    controller.attach(new FakeMediaElement() as unknown as HTMLMediaElement);
    setActionHandler.mockClear();

    injector.destroy();

    const nulledActions = setActionHandler.mock.calls
      .filter((call) => call[1] === null)
      .map((call) => call[0])
      .sort();
    expect(nulledActions).toEqual(['pause', 'play', 'seekbackward', 'seekforward', 'seekto']);
    vi.unstubAllGlobals();
  });
});
