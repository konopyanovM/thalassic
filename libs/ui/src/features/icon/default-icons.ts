import { systemIcon } from './system-icon';

/**
 * Built-in SVG for every {@link systemIcon}. A coherent 24×24 stroked set drawn
 * with `currentColor`, no intrinsic width/height so each icon scales to its
 * host box. Consumers override individual entries via `provideThalassicIcons`.
 */
export const DEFAULT_ICONS: Record<systemIcon, string> = {
  check: svg('<polyline points="20 6 9 17 4 12" />'),
  indeterminate: svg('<line x1="5" y1="12" x2="19" y2="12" />'),
  'chevron-up': svg('<polyline points="18 15 12 9 6 15" />'),
  'chevron-down': svg('<polyline points="6 9 12 15 18 9" />'),
  'chevron-left': svg('<polyline points="15 18 9 12 15 6" />'),
  'chevron-right': svg('<polyline points="9 18 15 12 9 6" />'),
  'chevrons-left': svg(
    '<polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />',
  ),
  'chevrons-right': svg(
    '<polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />',
  ),
  close: svg('<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />'),
  star: svg(
    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />',
  ),
  // The same star, solid. Stroked like the outline version so the two glyphs
  // share an identical footprint and can be layered over one another.
  'star-filled': svg(
    '<polygon fill="currentColor" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />',
  ),
  success: svg('<circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" />'),
  warning: svg(
    '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />' +
      '<line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />',
  ),
  error: svg(
    '<circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />',
  ),
  info: svg(
    '<circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />',
  ),
  bold: svg('<path d="M6 4h8a4 4 0 0 1 0 8H6z" /><path d="M6 12h9a4 4 0 0 1 0 8H6z" />'),
  italic: svg(
    '<line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />',
  ),
  strikethrough: svg(
    '<path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" />',
  ),
  'inline-code': svg('<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />'),
  'bullet-list': svg(
    '<line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />' +
      '<line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />',
  ),
  'ordered-list': svg(
    '<line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />' +
      '<path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />',
  ),
  blockquote: svg('<path d="M3 21c3 0 7-1 7-8V5H3v7h4" /><path d="M14 21c3 0 7-1 7-8V5h-7v7h4" />'),
  link: svg(
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />' +
      '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />',
  ),
  'code-block': svg(
    '<rect x="3" y="4" width="18" height="16" rx="2" /><polyline points="10 9 8 12 10 15" /><polyline points="14 9 16 12 14 15" />',
  ),
  // The magnifier of all three zoom glyphs is identical, so only the mark inside
  // the lens distinguishes them.
  'zoom-in': svg(
    '<circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />' +
      '<line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />',
  ),
  'zoom-out': svg(
    '<circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />' +
      '<line x1="8" y1="11" x2="14" y2="11" />',
  ),
  'zoom-reset': svg(
    '<circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />' +
      '<path d="M8.5 11.5a2.5 2.5 0 1 1 .8 1.8" /><polyline points="8.4 9.2 8.4 11.6 10.8 11.6" />',
  ),
};

function svg(body: string): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    body +
    '</svg>'
  );
}
