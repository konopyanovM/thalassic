import { colorFormat } from './color-picker.types';

/** Fallback color when the bound value is absent or unparsable. */
export const COLOR_PICKER_DEFAULT_VALUE = '#000000';

/** Saturation/brightness change per arrow-key press, as a 0–1 ratio. */
export const SV_KEYBOARD_STEP = 0.01;

/** Saturation/brightness change per shift-arrow press, as a 0–1 ratio. */
export const SV_KEYBOARD_STEP_LARGE = 0.1;

/** Order the readout's format toggle cycles through. */
export const FORMAT_CYCLE: colorFormat[] = ['hex', 'rgb', 'hsl'];
