import { Component, computed, inject, input, Signal } from '@angular/core';
import { hexFromArgb, TonalPalette } from '@material/material-color-utilities';
import { CopyTracker } from '../../services';
import { PALETTE_TONES, SWATCH_INK } from '../../theme-generator.constants';
import { paletteName, ToneSwatch } from '../../types';
import { contrastRatio } from '../../utils';

/** Every exported tone of one palette as a row of swatches; activating a swatch copies its hex. */
@Component({
  selector: 'app-palette-strip',
  templateUrl: './palette-strip.html',
  styleUrl: './palette-strip.scss',
  providers: [CopyTracker],
  host: { role: 'group', '[attr.aria-labelledby]': 'titleId()' },
})
export class PaletteStrip {
  // Injections
  /** Tracks which swatch was copied last, for its "Copied" feedback. */
  protected readonly copyTracker = inject(CopyTracker);

  // Inputs
  /** Palette name, shown as the strip's title. */
  public readonly name = input.required<paletteName>();
  /** Palette the swatches are painted from. */
  public readonly palette = input.required<TonalPalette>();

  // Computed
  /** Id of the title element naming the group. */
  protected readonly titleId: Signal<string> = computed(() => `palette-strip-${this.name()}`);

  /** One swatch per exported tone, inked in whichever of light and dark contrasts more with it. */
  protected readonly swatches: Signal<ToneSwatch[]> = computed(() =>
    PALETTE_TONES.map(tone => {
      const hex = hexFromArgb(this.palette().tone(tone));
      const lightInkWins =
        contrastRatio(hex, SWATCH_INK.light) >= contrastRatio(hex, SWATCH_INK.dark);

      return { tone, hex, ink: lightInkWins ? SWATCH_INK.light : SWATCH_INK.dark };
    }),
  );

  /** Announcement for the last copy, empty while there is nothing to announce. */
  protected readonly copyAnnouncement: Signal<string> = computed(() => {
    const copied = this.copyTracker.copiedKey();
    return copied ? `Copied ${copied}` : '';
  });
}
