import {
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  TemplateRef,
} from '@angular/core';
import { Point } from '@thalassic/core';
import { TooltipTrigger } from './tooltip-trigger';
import { tooltipSource } from './tooltip.types';

/**
 * Attaches a tooltip to the host element. Shows on hover and on focus landing anywhere inside
 * the host — a host that only wraps its real control is served as well as one that is the
 * control — toggles on touch, and dismisses on Escape without moving the pointer or focus
 * (WCAG 1.4.13). While visible the tooltip is linked with `aria-describedby` to the element it
 * describes: the host, or the control inside it that holds focus, since a description is only
 * announced on the element that has it. The link joins any description that element already
 * carries rather than replacing it, and leaves that one behind when the tooltip hides.
 *
 * Interaction is driven by pointer events, branching on `pointerType`: mouse
 * and pen get hover semantics, touch gets tap-to-toggle. A single stream avoids
 * the synthesized mouse events browsers replay after a tap.
 *
 * Content is live: a tooltip already on screen follows the input it was opened with.
 *
 * Serving many elements at once costs one instance each; `[tlsTooltipDelegate]`
 * serves a whole subtree from one instead.
 */
@Directive({
  selector: '[tlsTooltip]',
  host: {
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerleave)': 'onPointerLeave($event)',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class TooltipDirective extends TooltipTrigger {
  // Injections
  private readonly _element: HTMLElement =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  // Inputs
  public readonly content = input<string | TemplateRef<unknown>>('', { alias: 'tlsTooltip' });
  public readonly data: InputSignal<unknown> = input<unknown>(null);

  constructor() {
    super();

    // The text of a visible tooltip follows the input, so a label that changes under a pointer
    // resting on it is not a stale one until the next hover.
    effect(() => this._updateContent(this.content(), this.data()));
  }

  // Protected methods
  protected onPointerEnter(event: PointerEvent): void {
    // A touch "enter" is a tap, not a hover — toggle instead. The default is
    // not prevented, so the tap still activates an interactive host.
    if (event.pointerType === 'touch') {
      if (this._isTapped(this._element)) {
        this._hide('touch');
      } else {
        this._showHost('touch');
      }
      return;
    }

    this._showHost('hover', { x: event.clientX, y: event.clientY });
  }

  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;

    if (this.tooltipOrigin() === 'cursor') {
      this._tooltipService.move(this, { x: event.clientX, y: event.clientY });
    }
  }

  protected onPointerLeave(event: PointerEvent): void {
    // A tap retires its pointer immediately, firing `pointerleave` within the
    // same gesture; hiding here would undo the toggle the tap just made.
    if (event.pointerType === 'touch') return;

    this._hide('hover');
  }

  protected onFocusIn(event: FocusEvent): void {
    // `focus` does not bubble, so a host that only wraps its real control — a button component
    // whose <button> is inside the template — would never hear about the focus its own tooltip
    // is for. `focusin` does, and the control that took focus is what the tooltip describes.
    const focused = event.target;
    // No cursor to anchor to; a focus-triggered tooltip always anchors to the element.
    this._showHost('focus', null, focused instanceof HTMLElement ? focused : null);
  }

  protected onFocusOut(event: FocusEvent): void {
    // Focus moving between controls inside the host is not a leave.
    const next = event.relatedTarget;
    if (next instanceof Node && this._element.contains(next)) return;

    this._hide('focus');
  }

  // Private methods
  private _showHost(
    source: tooltipSource,
    point: Point | null = null,
    describedElement: HTMLElement | null = null,
  ): void {
    const anchor = this._element;

    this._show(source, {
      anchor,
      describedElement: describedElement ?? anchor,
      content: this.content(),
      data: this.data(),
      point,
    });
  }
}
