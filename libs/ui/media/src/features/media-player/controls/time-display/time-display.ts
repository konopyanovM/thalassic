import { computed, Component, inject, Signal } from '@angular/core';
import { MediaController } from '../../media-controller';
import { formatMediaTime } from '../scrubber/scrubber';

/**
 * Renders playback position as `current / total`, e.g. `1:23 / 4:05`. Purely
 * decorative: the scrubber's `aria-valuetext` already announces the same
 * information to assistive technology, so this display is hidden from it.
 */
@Component({
  selector: 'tls-media-time-display',
  templateUrl: './time-display.html',
  styleUrl: './time-display.scss',
  host: {
    class: 'tls-media-time-display',
    'aria-hidden': 'true',
  },
})
export class MediaTimeDisplay {
  // Injections
  private readonly _controller = inject(MediaController);

  // Computed
  protected readonly current: Signal<string> = computed(() =>
    formatMediaTime(this._controller.currentTime()),
  );
  protected readonly total: Signal<string> = computed(() =>
    formatMediaTime(this._controller.duration()),
  );
}
