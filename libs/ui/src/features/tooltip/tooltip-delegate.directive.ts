import {
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import { Point } from '@thalassic/core';
import { DEFAULT_TOOLTIP_CONTENT_ATTRIBUTE } from './tooltip.constants';
import { TooltipService } from './tooltip.service';
import { TooltipTrigger } from './tooltip-trigger';

/**
 * Serves tooltips for a whole subtree from one instance. Any descendant carrying the content
 * attribute (`data-tooltip` by default) gets a tooltip, without each one needing its own
 * `[tlsTooltip]`. Events are delegated to this host, so a grid of hundreds of cells costs one
 * directive, one overlay service and one set of listeners rather than one of each per cell.
 *
 * Interaction matches `[tlsTooltip]`: hover for mouse and pen, tap-to-toggle for touch, show
 * on keyboard focus, dismiss on Escape without moving the pointer or focus (WCAG 1.4.13), and
 * `aria-describedby` linking the item to the visible tooltip — joining any description the item
 * already carries, and omitted entirely when the item's `aria-label` already says the same thing.
 *
 * Trade-off: content is a plain string read from an attribute when the tooltip opens, so a
 * `TemplateRef` tooltip is not available here and an attribute change while the tooltip is
 * visible shows up on the next open. Reach for `[tlsTooltip]` when a handful of tooltips need
 * rich content, and for this one when the number of them is what costs.
 */
@Directive({
  selector: '[tlsTooltipDelegate]',
  providers: [TooltipService],
  host: {
    '(pointerover)': 'onPointerOver($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerout)': 'onPointerOut($event)',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class TooltipDelegateDirective extends TooltipTrigger {
  // Injections
  private readonly _elementRef = inject(ElementRef);

  // Inputs
  /**
   * Attribute a descendant carries its tooltip text in, which also matches the descendants
   * that own a tooltip. Written bare (`tlsTooltipDelegate`) it stays at the default.
   */
  public readonly contentAttribute: InputSignalWithTransform<string, string | undefined> = input(
    DEFAULT_TOOLTIP_CONTENT_ATTRIBUTE,
    {
      alias: 'tlsTooltipDelegate',
      transform: attribute => attribute || DEFAULT_TOOLTIP_CONTENT_ATTRIBUTE,
    },
  );

  // Computed
  private readonly _selector: Signal<string> = computed(() => `[${this.contentAttribute()}]`);

  // Protected methods
  protected onPointerOver(event: PointerEvent): void {
    const item = this._resolveItem(event.target);
    if (!item) return;

    // A touch "over" is a tap, not a hover — toggle instead. The default is not prevented,
    // so the tap still activates an interactive item.
    if (event.pointerType === 'touch') {
      if (this.anchor === item) {
        this._hide();
      } else {
        this._showItem(item);
      }
      return;
    }

    this._showItem(item, { x: event.clientX, y: event.clientY });
  }

  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    if (!this.anchor) return;

    if (this.tooltipOrigin() === 'cursor') {
      this._tooltipService.move({ x: event.clientX, y: event.clientY }, this._positions());
    }
  }

  protected onPointerOut(event: PointerEvent): void {
    // A tap retires its pointer immediately, firing `pointerout` within the same gesture;
    // hiding here would undo the toggle the tap just made.
    if (event.pointerType === 'touch') return;
    if (!this.anchor) return;

    // Crossing between children of the same item is not a leave.
    if (this._resolveItem(event.relatedTarget) === this.anchor) return;

    this._hide();
  }

  protected onFocusIn(event: FocusEvent): void {
    const item = this._resolveItem(event.target);
    if (!item) return;

    // No cursor to anchor to; a focus-triggered tooltip always anchors to the item.
    this._showItem(item);
  }

  protected onFocusOut(event: FocusEvent): void {
    // Focus moving between children of the same item is not a leave.
    if (this._resolveItem(event.relatedTarget) === this.anchor) return;

    this._hide();
  }

  // Private methods
  /** The tooltip-owning ancestor of `target` within this subtree, if there is one. */
  private _resolveItem(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) return null;

    const item = target.closest<HTMLElement>(this._selector());
    if (!item) return null;
    // `closest` walks past this host, so an item of an outer delegate is not ours to serve.
    if (!this._elementRef.nativeElement.contains(item)) return null;

    return item;
  }

  private _showItem(item: HTMLElement, point?: Point): void {
    const content = item.getAttribute(this.contentAttribute());
    if (!content) return;

    this._show(item, content, null, point);
  }
}
