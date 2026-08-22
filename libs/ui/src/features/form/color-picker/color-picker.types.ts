/** Text notation a color can be displayed and typed in. */
export type colorFormat = 'hex' | 'rgb' | 'hsl';

/** Color in RGB space: channels 0–255, alpha 0–1. */
export interface Rgba {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

/**
 * Color in HSV (hue–saturation–value) space: hue 0–360, the rest 0–1.
 * HSV keeps hue meaningful at zero saturation or value, which is why the
 * picker holds its working state in this space.
 */
export interface Hsva {
  hue: number;
  saturation: number;
  value: number;
  alpha: number;
}

/**
 * Shape of the platform's EyeDropper API (not yet in the DOM lib typings):
 * `open()` resolves with the picked screen color once the user clicks.
 */
export interface EyeDropperConstructor {
  new (): { open(): Promise<{ sRGBHex: string }> };
}

/** Color in HSL space: hue 0–360, the rest 0–1. */
export interface Hsla {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
}
