import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { size } from '../../types';

/**
 * Presentational color chip: renders a color over a transparency checkerboard,
 * so translucent colors stay legible. Display-only — wrap it in a button when it
 * needs to be interactive.
 */
@Component({
  selector: 'tls-color-swatch',
  template: '',
  styleUrl: './color-swatch.scss',
  host: {
    role: 'img',
    '[class]': 'hostClasses()',
    '[style.--tls-color-swatch-color]': 'value()',
    '[attr.aria-label]': 'label()',
  },
})
export class ColorSwatch {
  // Inputs
  /**
   * Color to display, in any notation CSS accepts — a hex string
   * (`#3b82f6`, `#3b82f680`), a function, or a custom property that resolves to
   * one (`var(--color-blue)`). The value is painted, never parsed, so a color
   * that only the browser can resolve renders like any other.
   */
  public readonly value: InputSignal<string> = input.required<string>();
  public readonly size: InputSignal<size> = input<size>('md');
  /** Accessible name; the value itself is announced when unset. */
  public readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() => [
    'tls-color-swatch',
    `tls-color-swatch--${this.size()}`,
  ]);

  protected readonly label: Signal<string> = computed(() => this.ariaLabel() ?? this.value());
}
