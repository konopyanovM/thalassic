import { DestroyRef, DOCUMENT, inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { THEME_STYLESHEET_ID } from '../theme-generator.constants';

/**
 * Owns a single `<style>` element in the document head carrying generated
 * theme rules. The element is created on the first write and removed when the
 * providing injector is destroyed, so the theme never outlives its page.
 */
@Injectable()
export class ThemeStylesheet {
  // Injections
  private readonly _document = inject(DOCUMENT);
  private readonly _renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  // State
  /** The managed `<style>` element; `null` until the first write and after removal. */
  private _element: HTMLStyleElement | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.remove());
  }

  // Public methods
  /** Replaces the stylesheet's rules, creating the element on first use. */
  public write(css: string): void {
    if (!this._element) this._element = this._adoptOrCreate();

    this._element.textContent = css;
  }

  /** Detaches the stylesheet; a later write creates it afresh. */
  public remove(): void {
    if (!this._element) return;

    this._renderer.removeChild(this._document.head, this._element);
    this._element = null;
  }

  // Private methods
  /**
   * The stylesheet element: one already in the head — as a server-rendered page
   * ships it — is taken over, so hydration never leaves a stale copy behind.
   */
  private _adoptOrCreate(): HTMLStyleElement {
    // Matched by id, not `instanceof`: the server DOM exposes no element constructors as globals.
    const existing = this._document.getElementById(THEME_STYLESHEET_ID);
    if (existing) return existing as HTMLStyleElement;

    const element = this._renderer.createElement('style') as HTMLStyleElement;
    this._renderer.setAttribute(element, 'id', THEME_STYLESHEET_ID);
    this._renderer.appendChild(this._document.head, element);
    return element;
  }
}
