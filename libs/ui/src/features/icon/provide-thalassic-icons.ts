import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { iconRegistry } from './icon-registry';
import { ICON_REGISTRY } from './icon-registry.token';

/**
 * Override any of the library's built-in {@link systemIcon}s with your own kit.
 * Each entry is raw SVG markup or a component class; names left unset keep the
 * library defaults. Register once in the application config:
 *
 * ```ts
 * provideThalassicIcons({
 *   close: '<svg>…</svg>',
 *   'chevron-down': MyChevronComponent,
 * })
 * ```
 */
export function provideThalassicIcons(icons: iconRegistry): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ICON_REGISTRY, useValue: icons }]);
}
