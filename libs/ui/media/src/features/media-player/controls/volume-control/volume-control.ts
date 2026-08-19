import { Directionality } from '@angular/cdk/bidi';
import { computed, Component, inject, signal, Signal } from '@angular/core';
import { Icon, systemIcon } from '@thalassic/ui';
import { MediaController } from '../../media-controller';
import { VOLUME_STEP } from '../../media-player.constants';
import { MEDIA_PLAYER_CONFIG } from '../../media-player.token';

/**
 * Mute toggle paired with a `role="slider"` volume bar over `[0, 1]`, mirroring
 * the scrubber's pointer-drag and keyboard-step pattern. Reads and writes
 * through the attached {@link MediaController}; horizontal arrow keys are
 * direction-resolved so "increase" always points toward higher volume.
 *
 * On fine pointers the slider stays collapsed until the control is hovered or
 * holds focus; the drag modifier keeps it out while a captured pointer roams
 * beyond the host. Coarse pointers have no hover, so there the slider is
 * always expanded.
 */
@Component({
  selector: 'tls-media-volume-control',
  imports: [Icon],
  templateUrl: './volume-control.html',
  styleUrl: './volume-control.scss',
  host: {
    class: 'tls-media-volume-control',
    '[class.tls-media-volume-control--dragging]': 'dragging()',
  },
})
export class MediaVolumeControl {
  // Injections
  private readonly _controller = inject(MediaController);
  private readonly _config = inject(MEDIA_PLAYER_CONFIG);
  private readonly _directionality = inject(Directionality);

  // State
  protected readonly dragging = signal(false);
  private _pointerId: number | null = null;

  protected readonly labels = this._config.labels;

  // Computed
  protected readonly muted: Signal<boolean> = this._controller.muted;
  protected readonly volume: Signal<number> = this._controller.volume;
  protected readonly muteLabel: Signal<string> = computed(() =>
    this.muted() ? this.labels.unmute : this.labels.mute,
  );
  protected readonly muteIcon: Signal<systemIcon> = computed(() =>
    this.muted() ? 'volume-muted' : 'volume',
  );
  /** Visual fill only — collapses to empty when muted; mute state itself is conveyed by the mute button's `aria-pressed`. */
  protected readonly filledFraction: Signal<number> = computed(() =>
    this.muted() ? 0 : this.volume(),
  );
  /** ARIA value always reports the retained volume, unaffected by mute, so a muted slider still announces its true level. */
  protected readonly valueNow: Signal<number> = computed(() => Math.round(this.volume() * 100));

  // Protected methods
  protected toggleMute(): void {
    this._controller.toggleMute();
  }

  protected onPointerDown(event: PointerEvent): void {
    // Only the primary button starts a drag: a secondary press (context menu)
    // never delivers a matching pointerup, which would strand the drag state.
    if (event.button !== 0) return;
    this.dragging.set(true);
    this._pointerId = event.pointerId;
    const host = event.currentTarget as HTMLElement;
    host.setPointerCapture(event.pointerId);
    this._controller.setVolume(this._volumeFromPointer(event, host));
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging() || event.pointerId !== this._pointerId) return;
    this._controller.setVolume(
      this._volumeFromPointer(event, event.currentTarget as HTMLElement),
    );
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragging() || event.pointerId !== this._pointerId) return;
    this.dragging.set(false);
    this._pointerId = null;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  /** Aborted pointers (touch cancellation, capture loss) must release the drag state or the reveal sticks open. */
  protected onPointerCancel(): void {
    this.dragging.set(false);
    this._pointerId = null;
  }

  protected onKeydown(event: KeyboardEvent): void {
    const increaseKey = this._directionality.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const decreaseKey = this._directionality.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === increaseKey || event.key === 'ArrowUp') {
      this._controller.setVolume(this.volume() + VOLUME_STEP);
    } else if (event.key === decreaseKey || event.key === 'ArrowDown') {
      this._controller.setVolume(this.volume() - VOLUME_STEP);
    } else if (event.key === 'Home') {
      this._controller.setVolume(0);
    } else if (event.key === 'End') {
      this._controller.setVolume(1);
    } else return;
    event.preventDefault();
    event.stopPropagation();
  }

  // Private methods
  private _volumeFromPointer(event: PointerEvent, host: HTMLElement): number {
    const rect = host.getBoundingClientRect();
    let fraction = (event.clientX - rect.left) / rect.width;
    if (this._directionality.value === 'rtl') fraction = 1 - fraction;
    return Math.min(Math.max(fraction, 0), 1);
  }
}
