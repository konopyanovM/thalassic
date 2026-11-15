import { DestroyRef, DOCUMENT, inject, Injectable, signal } from '@angular/core';

/**
 * Counts the submissions of every form in the document. Signal forms mark each field touched
 * when its form is submitted but keep no record of the submission itself, and a control needs
 * one to tell a field the user has left untouched from one a submission has called to account.
 * One listener on the document serves every form, so a control needs nothing from its template
 * to be told, and a form that leaves the document leaves no count behind. A form is found from a
 * control's place in the document, so a field rendered outside its form's element — in an overlay
 * the form opens — sees no submission, and is judged by the user's changes to it alone.
 */
@Injectable({ providedIn: 'root' })
export class FormSubmissions {
  // Injections
  private readonly _document = inject(DOCUMENT);

  // State
  /** Submissions per form, held weakly so a form that leaves the document is not kept. */
  private readonly _counts = new WeakMap<HTMLFormElement, number>();
  /** Advances on every submission, so a reader of any count learns to read it again. */
  private readonly _version = signal<number>(0);

  // constructor
  constructor() {
    const onSubmit = (event: Event): void => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      this._counts.set(form, (this._counts.get(form) ?? 0) + 1);
      this._version.update((version) => version + 1);
    };

    // Captured, so the count has moved before the form's own handler marks its fields touched.
    this._document.addEventListener('submit', onSubmit, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      this._document.removeEventListener('submit', onSubmit, { capture: true }),
    );
  }

  // Public methods
  /** How many times the form around `element` has been submitted; none outside a form. Reactive. */
  public countFor(element: Element): number {
    this._version();

    const form = element.closest('form');
    if (!form) return 0;

    return this._counts.get(form) ?? 0;
  }
}
