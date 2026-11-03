import { ElementRef, InjectionToken } from '@angular/core';

/**
 * The element that draws the border of the field a control sits in, provided by a wrapper
 * that frames one or more controls and their addons as a single field. A control with no
 * such wrapper above it draws its own border and is its own frame.
 */
export const FORM_CONTROL_FRAME = new InjectionToken<ElementRef<HTMLElement>>('FORM_CONTROL_FRAME');
