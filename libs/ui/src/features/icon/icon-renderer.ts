import { Type } from '@angular/core';

/**
 * A registry entry for a {@link systemIcon}. Either raw SVG markup (sanitized
 * before it is rendered) or a component class that renders the icon itself —
 * the escape hatch for plugging in a third-party icon kit
 */
export type iconRenderer = string | Type<unknown>;
