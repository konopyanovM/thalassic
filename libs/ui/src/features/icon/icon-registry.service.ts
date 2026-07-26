import { inject, Injectable } from '@angular/core';
import { DEFAULT_ICONS } from './default-icons';
import { iconRenderer } from './icon-renderer';
import { ICON_REGISTRY } from './icon-registry.token';
import { systemIcon } from './system-icon';

/**
 * Resolves a {@link systemIcon} name to its {@link iconRenderer}, applying any
 * consumer overrides from {@link ICON_REGISTRY} over {@link DEFAULT_ICONS}.
 */
@Injectable({ providedIn: 'root' })
export class IconRegistry {
  // Injections
  private readonly _overrides = inject(ICON_REGISTRY, { optional: true });

  // State
  private readonly _icons: Record<systemIcon, iconRenderer> = {
    ...DEFAULT_ICONS,
    ...this._overrides,
  };

  // Public methods
  public resolve(name: systemIcon): iconRenderer {
    return this._icons[name];
  }
}
