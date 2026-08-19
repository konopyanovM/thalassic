import { computed, Component, inject, Signal } from '@angular/core';
import { Icon, systemIcon } from '@thalassic/ui';
import { MediaController } from '../../media-controller';
import { MEDIA_PLAYER_CONFIG } from '../../media-player.token';

/** Toggles playback, swapping its icon and accessible name between play, pause and replay. */
@Component({
  selector: 'tls-media-play-toggle',
  imports: [Icon],
  templateUrl: './play-toggle.html',
  styleUrl: './play-toggle.scss',
  host: {
    class: 'tls-media-play-toggle',
  },
})
export class MediaPlayToggle {
  // Injections
  private readonly _controller = inject(MediaController);
  private readonly _config = inject(MEDIA_PLAYER_CONFIG);

  protected readonly labels = this._config.labels;

  // Computed
  protected readonly playing: Signal<boolean> = this._controller.playing;
  protected readonly ended: Signal<boolean> = computed(() => this._controller.state() === 'ended');
  protected readonly label: Signal<string> = computed(() => {
    if (this.ended()) return this.labels.replay;
    return this.playing() ? this.labels.pause : this.labels.play;
  });
  protected readonly iconName: Signal<systemIcon> = computed(() => {
    if (this.ended()) return 'replay';
    return this.playing() ? 'pause' : 'play';
  });

  // Protected methods
  protected toggle(): void {
    this._controller.togglePlay();
  }
}
