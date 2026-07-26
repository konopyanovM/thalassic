import { EnvironmentProviders } from '@angular/core';
import { iconRegistry, provideThalassicIcons, systemIcon } from '@thalassic/ui';
import { fontAwesomeIcon } from './font-awesome-icon';

/**
 * Override the library's built-in {@link systemIcon}s with FontAwesome icons.
 * Each FontAwesome definition is converted to inline SVG (with
 * `fill="currentColor"`, so it inherits color and box sizing like the defaults)
 * and registered through `provideThalassicIcons`. Names left unset keep the
 * library defaults.
 *
 * ```ts
 * import { faXmark, faChevronDown } from '@fortawesome/free-solid-svg-icons';
 * import { provideFontAwesomeIcons } from '@thalassic/ui/fontawesome';
 *
 * provideFontAwesomeIcons({
 *   close: faXmark,
 *   'chevron-down': faChevronDown,
 * });
 * ```
 */
export function provideFontAwesomeIcons(
  icons: Partial<Record<systemIcon, fontAwesomeIcon>>,
): EnvironmentProviders {
  const registry: iconRegistry = {};

  for (const name of Object.keys(icons) as systemIcon[]) {
    const definition = icons[name];
    if (!definition) continue;
    registry[name] = faToSvg(definition);
  }

  return provideThalassicIcons(registry);
}

function faToSvg(definition: fontAwesomeIcon): string {
  const [width, height, , , pathData] = definition.icon;
  const paths = Array.isArray(pathData) ? pathData : [pathData];
  const body = paths.map(data => `<path d="${data}" />`).join('');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor">` +
    body +
    '</svg>'
  );
}
