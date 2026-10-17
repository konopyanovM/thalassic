import { paletteName } from './palette-name';

/** Where a color role takes its value: one tone of one palette. */
export interface RoleTone {
  /** Palette the tone is read from. */
  palette: paletteName;
  /** HCT tone, 0 (black) to 100 (white). */
  tone: number;
}
