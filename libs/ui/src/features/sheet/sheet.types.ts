import { TemplateRef } from '@angular/core';

/**
 * How tall a detent is: the header slot's height (`'header'`), the header plus
 * the body's natural height (`'content'`), a share of the viewport (`'50%'`),
 * or any CSS length (`'20rem'`). Every size but the header's is capped at the
 * tallest the sheet may grow, which keeps the theme's top clearance free.
 */
export type sheetDetentSize = 'header' | 'content' | `${number}%` | string;

/** One resting height of a sheet. Listed smallest to largest by the author. */
export interface SheetDetent {
  id: string;
  size: sheetDetentSize;
}

/** Measurements, in px, a detent size is resolved against. */
export interface SheetMeasures {
  /** Rendered height of the header slot. */
  header: number;
  /** Header plus the body's natural (unclipped) height. */
  content: number;
  /** Height of the viewport, the base a percentage resolves against. */
  viewport: number;
  /** The tallest the sheet may grow: the viewport less the top clearance. */
  maximum: number;
  /** Resolves a CSS length against the sheet's own font and viewport. */
  length: (css: string) => number;
}

/**
 * Where focus goes when a sheet stops being modal: back to its header when the
 * sheet stays, or to what the page had focused when the sheet is going.
 */
export type sheetFocusRestoreTarget = 'header' | 'page';

/** The header slot's template, read by the sheet. */
export interface SheetHeaderTemplate {
  templateRef: TemplateRef<unknown>;
}
