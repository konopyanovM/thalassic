/**
 * The translation in px that `element`'s transform puts it at this frame. A
 * transform mid-transition reads as the running value rather than its target,
 * so a surface caught by a new drag while it settles is picked up where it is
 * drawn. An element with no transform reads as untranslated.
 */
export function drawnTranslation(element: Element): { x: number; y: number } {
  const transform = getComputedStyle(element).transform;
  if (transform === '' || transform === 'none') return { x: 0, y: 0 };

  const matrix = new DOMMatrixReadOnly(transform);
  return { x: matrix.m41, y: matrix.m42 };
}
