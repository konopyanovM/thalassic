import { Directionality } from '@angular/cdk/bidi';
import {
  afterNextRender,
  booleanAttribute,
  computed,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { Icon, Loader } from '@thalassic/ui';
import { MediaPlayToggle } from '../controls/play-toggle/play-toggle';
import { MediaScrubber } from '../controls/scrubber/scrubber';
import { MediaSettingsMenu } from '../controls/settings-menu/settings-menu';
import { MediaTimeDisplay } from '../controls/time-display/time-display';
import { MediaVolumeControl } from '../controls/volume-control/volume-control';
import { FullscreenController } from '../fullscreen-controller';
import { MediaController } from '../media-controller';
import { VOLUME_STEP } from '../media-player.constants';
import { MEDIA_PLAYER_CONFIG } from '../media-player.token';
import { MediaCaptionSource, mediaState } from '../media-player.types';

/**
 * Video playback surface assembling the headless {@link MediaController} and
 * {@link FullscreenController} with the feature's control set behind a
 * `role="group"` host. The single place in the feature that owns a `<video>`
 * element, attaches both controllers to it, and maps player-level keyboard
 * shortcuts (space/k play, arrow seek/volume, m mute, f fullscreen, c
 * captions, Home/End) to controller calls. Controls fade out during playback
 * once the pointer has been idle for the configured delay, and reappear on
 * pointer activity, keyboard focus, or while the settings menu is open.
 */
@Component({
  selector: 'tls-video-player',
  imports: [
    Icon,
    Loader,
    MediaPlayToggle,
    MediaScrubber,
    MediaSettingsMenu,
    MediaTimeDisplay,
    MediaVolumeControl,
  ],
  templateUrl: './video-player.html',
  styleUrl: './video-player.scss',
  providers: [MediaController, FullscreenController],
  host: {
    role: 'group',
    class: 'tls-video-player',
    tabindex: '0',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
    '[class.tls-video-player--controls-hidden]': 'controlsHidden()',
    '(keydown)': 'onKeydown($event)',
    '(pointermove)': 'onPointerActivity()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class VideoPlayer {
  // Injections
  private readonly _controller = inject(MediaController);
  private readonly _fullscreenController = inject(FullscreenController);
  private readonly _config = inject(MEDIA_PLAYER_CONFIG);
  private readonly _directionality = inject(Directionality);
  private readonly _host = inject(ElementRef<HTMLElement>);
  private readonly _destroyRef = inject(DestroyRef);

  // Inputs
  public readonly source: InputSignal<string> = input.required<string>();
  public readonly title: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public readonly poster: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public readonly captions: InputSignal<MediaCaptionSource[]> = input<MediaCaptionSource[]>([]);
  /**
   * Requests playback as soon as the source can play. Browsers only honor
   * autoplay when the element is also muted — an unmuted request is silently
   * rejected, and the rejection is not surfaced as an error; the player falls
   * back to its poster with the ordinary play affordance so the user can start
   * playback (with sound) explicitly.
   */
  public readonly autoplay: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  public readonly loop: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  public readonly muted: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  public readonly preload: InputSignal<'none' | 'metadata' | 'auto'> = input<
    'none' | 'metadata' | 'auto'
  >(this._config.preload);
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  // Outputs
  // eslint-disable-next-line @angular-eslint/no-output-native -- mirrors the native <video> 'ended' event this output relays, which is the clearest name for that meaning.
  public readonly ended = output<void>();
  public readonly playingChange = output<boolean>();

  // State
  private readonly _videoElement = viewChild.required<ElementRef<HTMLVideoElement>>('videoElement');
  private readonly _settingsMenu = viewChild(MediaSettingsMenu);
  private readonly _pointerIdle = signal(false);
  private readonly _focusWithin = signal(false);
  private readonly _attached = signal(false);
  private _hideTimer: ReturnType<typeof setTimeout> | null = null;
  private _skipInitialPlayingChange = true;

  protected readonly labels = this._config.labels;

  // Computed
  protected readonly state: Signal<mediaState> = this._controller.state;
  protected readonly fullscreen: Signal<boolean> = this._fullscreenController.fullscreen;
  protected readonly fullscreenSupported: Signal<boolean> =
    this._fullscreenController.fullscreenSupported;
  protected readonly pictureInPictureSupported: Signal<boolean> =
    this._fullscreenController.pictureInPictureSupported;
  private readonly _menuOpen: Signal<boolean> = computed(() => {
    const menu = this._settingsMenu();
    if (!menu) return false;
    return menu.open();
  });
  protected readonly controlsHidden: Signal<boolean> = computed(() => {
    if (!this._controller.playing()) return false;
    if (this._focusWithin()) return false;
    if (this._menuOpen()) return false;
    return this._pointerIdle();
  });

  // constructor
  constructor() {
    afterNextRender(() => {
      const videoElement = this._videoElement().nativeElement;
      this._controller.attach(videoElement);
      this._fullscreenController.attach(this._host.nativeElement, videoElement);
      this._attached.set(true);
    });
    // Re-runs whenever `source` (or `title`) changes after attach — not just once
    // at startup — so swapping either input mid-lifetime reaches the media element.
    effect(() => {
      if (!this._attached()) return;
      this._controller.setSource(this.source());
    });
    effect(() => {
      if (!this._attached()) return;
      const title = this.title();
      if (title) this._controller.setMetadata({ title });
    });
    effect(() => {
      const playing = this._controller.playing();
      if (this._skipInitialPlayingChange) {
        this._skipInitialPlayingChange = false;
        return;
      }
      this.playingChange.emit(playing);
    });
    effect(() => {
      if (this._controller.state() === 'ended') this.ended.emit();
    });
    // Controls fade out during playback even without pointer movement — armed
    // as soon as playback starts, and cancelled the moment it stops so the
    // chrome is visible again for a paused or ended surface.
    effect(() => {
      if (this._controller.playing()) {
        this._armHideTimer();
      } else {
        this._cancelHideTimer();
        this._pointerIdle.set(false);
      }
    });
    this._destroyRef.onDestroy(() => this._cancelHideTimer());
  }

  // Protected methods
  protected onKeydown(event: KeyboardEvent): void {
    if (event.target !== this._host.nativeElement) return;
    const step = this._config.seekStep;
    const rtl = this._directionality.value === 'rtl';
    switch (event.key) {
      case ' ':
      case 'k':
        this._controller.togglePlay();
        break;
      case 'ArrowRight':
        this._controller.seekBy(rtl ? -step : step);
        break;
      case 'ArrowLeft':
        this._controller.seekBy(rtl ? step : -step);
        break;
      case 'ArrowUp':
        this._controller.setVolume(this._controller.volume() + VOLUME_STEP);
        break;
      case 'ArrowDown':
        this._controller.setVolume(this._controller.volume() - VOLUME_STEP);
        break;
      case 'm':
        this._controller.toggleMute();
        break;
      case 'f':
        this._fullscreenController.toggleFullscreen();
        break;
      case 'c':
        this._toggleCaptions();
        break;
      case 'Home':
        this._controller.seek(0);
        break;
      case 'End':
        this._controller.seek(this._controller.duration());
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  protected onPointerActivity(): void {
    this._pointerIdle.set(false);
    this._armHideTimer();
  }

  protected onFocusIn(): void {
    this._focusWithin.set(true);
  }

  protected onFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as Node | null;
    if (relatedTarget !== null && this._host.nativeElement.contains(relatedTarget)) return;
    this._focusWithin.set(false);
  }

  protected onSurfaceClick(): void {
    this._controller.togglePlay();
  }

  protected togglePictureInPicture(): void {
    this._fullscreenController.togglePictureInPicture();
  }

  protected toggleFullscreen(): void {
    this._fullscreenController.toggleFullscreen();
  }

  protected retry(): void {
    this._controller.setSource(this.source());
    // A rejected play (autoplay policy or a still-broken source) leaves the
    // error panel's retry affordance in place; there is nothing further to do here.
    this._controller.play().catch(() => undefined);
  }

  // Private methods
  private _toggleCaptions(): void {
    const tracks = this._controller.textTracks();
    const activeTrack = tracks.find(track => track.active);
    if (activeTrack) {
      this._controller.selectTextTrack(null);
      return;
    }
    if (tracks.length > 0) this._controller.selectTextTrack(tracks[0].id);
  }

  private _armHideTimer(): void {
    this._cancelHideTimer();
    this._hideTimer = setTimeout(() => this._pointerIdle.set(true), this._config.controlsHideDelay);
  }

  private _cancelHideTimer(): void {
    if (this._hideTimer !== null) clearTimeout(this._hideTimer);
    this._hideTimer = null;
  }
}
