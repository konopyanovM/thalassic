import { SheetMeasures, sheetDetentSize } from './sheet.types';

const PERCENT = /^(\d+(?:\.\d+)?)%$/;

/** Height in px of a detent of `size`, given the sheet's current measures. */
export function resolveDetentHeight(size: sheetDetentSize, measures: SheetMeasures): number {
  if (size === 'header') return measures.header;
  if (size === 'content') return Math.min(measures.viewport, measures.content);

  const percent = PERCENT.exec(size);
  if (percent !== null) return (measures.viewport * Number(percent[1])) / 100;

  return Math.min(measures.viewport, measures.length(size));
}
