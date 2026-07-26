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
  'chevrons-left': svg('<polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />'),
  'chevrons-right': svg('<polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />'),
  close: svg('<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />'),
  success: svg('<circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" />'),
  warning: svg(
    '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />' +
      '<line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />',
  ),
  error: svg('<circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />'),
  info: svg('<circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />'),
};

function svg(body: string): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    body +
    '</svg>'
  );
}
