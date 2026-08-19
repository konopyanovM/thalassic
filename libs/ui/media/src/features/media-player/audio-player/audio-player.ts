import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  output,
  signal,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { MediaController } from '../media-controller';
import { MEDIA_PLAYER_CONFIG } from '../media-player.token';
import { MediaPlayToggle } from '../controls/play-toggle/play-toggle';
import { MediaScrubber } from '../controls/scrubber/scrubber';
import { MediaSettingsMenu } from '../controls/settings-menu/settings-menu';
import { MediaTimeDisplay } from '../controls/time-display/time-display';
import { MediaVolumeControl } from '../controls/volume-control/volume-control';

/**
 * Audio playback surface assembling the headless {@link MediaController} with
 * the feature's control set — play toggle, time display, scrubber, volume and
 * settings — behind a `role="group"` host. The single place in the feature
 * that owns an `<audio>` element and attaches the controller to it.
 */
@Component({
  selector: 'tls-audio-player',
  imports: [
    MediaPlayToggle,
    MediaScrubber,
    MediaTimeDisplay,
    MediaVolumeControl,
    MediaSettingsMenu,
  ],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss',
  providers: [MediaController],
  host: {
    role: 'group',
    class: 'tls-audio-player',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
  },
})
export class AudioPlayer {
  // Injections
  private readonly _controller = inject(MediaController);
  private readonly _config = inject(MEDIA_PLAYER_CONFIG);

  // Inputs
  public readonly source: InputSignal<string> = input.required<string>();
  public readonly title: InputSignal<string | undefined> = input<string | undefined>(undefined);
  /**
   * Requests playback as soon as the source can play. Browsers only honor
   * autoplay when the element is also muted — an unmuted request is silently
   * rejected, and the rejection is not surfaced as an error; the player falls
   * back to the ordinary play affordance so the user can start playback (with
   * sound) explicitly.
   */
  public readonly autoplay: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  public readonly loop: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  public readonly preload: InputSignal<'none' | 'metadata' | 'auto'> = input<
    'none' | 'metadata' | 'auto'
  >(this._config.preload);
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  // Outputs
  // eslint-disable-next-line @angular-eslint/no-output-native -- mirrors the native <audio> 'ended' event this output relays, which is the clearest name for that meaning.
  public readonly ended = output<void>();
  public readonly playingChange = output<boolean>();

  // State
  private readonly _audioElement = viewChild.required<ElementRef<HTMLAudioElement>>('audioElement');
  private readonly _attached = signal(false);
  private _skipInitialPlayingChange = true;

  // constructor
  constructor() {
    afterNextRender(() => {
      this._controller.attach(this._audioElement().nativeElement);
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
  }
}
