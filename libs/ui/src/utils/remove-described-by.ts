import { Renderer2 } from '@angular/core';

/**
 * Drops `id` from `element`'s `aria-describedby`, leaving the consumer's own descriptions in
 * place and removing the attribute only once nothing is left in it.
 */
export const removeDescribedBy = (renderer: Renderer2, element: Element, id: string): void => {
  const existing = element.getAttribute('aria-describedby');
  if (!existing) return;

  const tokens = existing.split(' ').filter(token => token && token !== id);

  if (tokens.length === 0) {
    renderer.removeAttribute(element, 'aria-describedby');
    return;
  }

  renderer.setAttribute(element, 'aria-describedby', tokens.join(' '));
};
