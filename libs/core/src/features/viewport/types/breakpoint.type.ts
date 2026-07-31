/**
 * Named viewport breakpoints, mirroring the SCSS `breakpoint` mixin
 * (`libs/core/src/styles/tools/_breakpoint.scss`). Each name maps to a
 * `max-width` threshold, so the semantics are desktop-first: a breakpoint
 * "matches" when the viewport is at or below its width.
 */
export type breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
