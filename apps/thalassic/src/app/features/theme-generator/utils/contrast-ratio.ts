import { parseColor, relativeLuminance } from '@thalassic/ui';

/** WCAG 2 contrast ratio of two `#rrggbb` colors, from 1 (identical luminance) to 21 (black on white). */
export function contrastRatio(first: string, second: string): number {
  const firstLuminance = luminanceOf(first);
  const secondLuminance = luminanceOf(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/** Relative luminance of a `#rrggbb` color; an unparsable value throws rather than skewing a grade. */
function luminanceOf(hex: string): number {
  const rgba = parseColor(hex);
  if (!rgba) throw new Error(`Not a color: ${hex}`);
  return relativeLuminance(rgba);
}
