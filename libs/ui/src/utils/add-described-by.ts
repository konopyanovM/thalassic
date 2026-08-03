import { Renderer2 } from '@angular/core';

/**
 * Adds `id` to `element`'s `aria-describedby`, preserving any description the consumer already
 * put there. The attribute is a token list, so an overlay describing an element joins that list
 * rather than replacing it.
 */
export const addDescribedBy = (renderer: Renderer2, element: Element, id: string): void => {
  const existing = element.getAttribute('aria-describedby');
  const tokens = existing ? existing.split(' ').filter(Boolean) : [];

  if (tokens.includes(id)) return;

  tokens.push(id);
  renderer.setAttribute(element, 'aria-describedby', tokens.join(' '));
};
