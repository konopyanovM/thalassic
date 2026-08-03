import { Directive, ElementRef, inject, input, InputSignal, TemplateRef } from '@angular/core';
import { Point } from '@thalassic/core';
import { TooltipService } from './tooltip.service';
import { TooltipTrigger } from './tooltip-trigger';

/**
 * Attaches a tooltip to the host element. Shows on hover and on keyboard focus,
 * toggles on touch, and dismisses on Escape without moving the pointer or focus
 * (WCAG 1.4.13). The tooltip is linked to the host via `aria-describedby` while
 * visible, joining any description the host already carries rather than replacing
 * it, and leaving that one behind when the tooltip hides.
 *
 * Interaction is driven by pointer events, branching on `pointerType`: mouse
 * and pen get hover semantics, touch gets tap-to-toggle. A single stream avoids
 * the synthesized mouse events browsers replay after a tap.
 *
 * Serving many elements at once costs one instance each; `[tlsTooltipDelegate]`
 * serves a whole subtree from one instead.
 */
@Directive({
  selector: '[tlsTooltip]',
  providers: [TooltipService],
  host: {
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerleave)': 'onPointerLeave($event)',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class TooltipDirective extends TooltipTrigger {
  // Injections
  private readonly _elementRef = inject(ElementRef);

  // Inputs
  public readonly content = input<string | TemplateRef<unknown>>('', { alias: 'tlsTooltip' });
  public readonly data: InputSignal<unknown> = input<unknown>(null);

  // Protected methods
  protected onPointerEnter(event: PointerEvent): void {
    // A touch "enter" is a tap, not a hover — toggle instead. The default is
    // not prevented, so the tap still activates an interactive host.
    if (event.pointerType === 'touch') {
      if (this.anchor) {
        this._hide();
      } else {
        this._showHost();
      }
      return;
    }

    this._showHost({ x: event.clientX, y: event.clientY });
  }

  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;

    if (this.tooltipOrigin() === 'cursor') {
      this._tooltipService.move({ x: event.clientX, y: event.clientY }, this._positions());
    }
  }

  protected onPointerLeave(event: PointerEvent): void {
    // A tap retires its pointer immediately, firing `pointerleave` within the
    // same gesture; hiding here would undo the toggle the tap just made.
    if (event.pointerType === 'touch') return;

    this._hide();
  }

  protected onFocus(): void {
    // No cursor to anchor to; a focus-triggered tooltip always anchors to the element.
    this._showHost();
  }

  protected onBlur(): void {
    this._hide();
  }

  // Private methods
  private _showHost(point?: Point): void {
    this._show(this._elementRef.nativeElement, this.content(), this.data(), point);
  }
}
