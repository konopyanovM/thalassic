/** One tone of a palette, ready to paint as a swatch. */
export interface ToneSwatch {
  /** HCT tone, 0 (black) to 100 (white). */
  tone: number;
  /** The tone's color as `#rrggbb`. */
  hex: string;
  /** Text color legible on the swatch. */
  ink: string;
}
