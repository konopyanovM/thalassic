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
import { TooltipTrigger } from './tooltip-trigger';
import { tooltipSource } from './tooltip.types';

/**
 * Serves tooltips for a whole subtree from one instance. Any descendant carrying the content
 * attribute (`data-tooltip` by default) gets a tooltip, without each one needing its own
 * `[tlsTooltip]`. Events are delegated to this host, so a grid of hundreds of cells costs one
 * directive and one set of listeners rather than one of each per cell.
 *
 * Interaction matches `[tlsTooltip]`: hover for mouse and pen, tap-to-toggle for touch, show
 * on keyboard focus, dismiss on Escape without moving the pointer or focus (WCAG 1.4.13), and
 * `aria-describedby` linking the visible tooltip to the item — or, when focus is inside a
 * composite item, to the control holding it — joining any description that element already
 * carries, and omitted entirely when its `aria-label` already says the same thing.
 *
 * Trade-off: content is a plain string read from an attribute when the tooltip opens, so a
 * `TemplateRef` tooltip is not available here and an attribute change while the tooltip is
 * visible shows up on the next open. Reach for `[tlsTooltip]` when a handful of tooltips need
 * rich content, and for this one when the number of them is what costs.
 */
@Directive({
  selector: '[tlsTooltipDelegate]',
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

    // A touch "over" is a tap, not a hover. On an interactive item the tap
    // already carries the item's own action, so the tooltip claims nothing;
    // elsewhere it toggles in hover's stead.
    if (event.pointerType === 'touch') {
      this._noteTouch();
      if (this._isInteractive(item)) return;

      if (this._isTapped(item)) {
        this._hide('touch');
      } else {
        this._showItem('touch', item);
      }
      return;
    }

    this._showItem('hover', item, { x: event.clientX, y: event.clientY });
  }

  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;

    if (this.tooltipOrigin() === 'cursor') {
      this._tooltipService.move(this, { x: event.clientX, y: event.clientY });
    }
  }

  protected onPointerOut(event: PointerEvent): void {
    // A tap retires its pointer immediately, firing `pointerout` within the same gesture;
    // hiding here would undo the toggle the tap just made.
    if (event.pointerType === 'touch') return;

    // Crossing into another item — or between children of the one being left — is not a leave:
    // the `pointerover` that follows re-anchors the tooltip without it ever coming down.
    if (this._resolveItem(event.relatedTarget)) return;

    this._hide('hover');
  }

  protected onFocusIn(event: FocusEvent): void {
    const item = this._resolveItem(event.target);
    if (!item) return;

    // The focus trigger serves readers who reach the item without a pointer;
    // focus handed over by a touch tap is not that reader, and would resurface
    // the tooltip the tap was told not to claim.
    if (this._followsTouch()) return;

    // No cursor to anchor to; a focus-triggered tooltip always anchors to the item. An item that
    // is a composite holds the control focus actually landed on, and that is what it describes.
    const focused = event.target;
    this._showItem('focus', item, null, focused instanceof HTMLElement ? focused : null);
  }

  protected onFocusOut(event: FocusEvent): void {
    // Focus moving between children of the same item is not a leave.
    const item = this._resolveItem(event.relatedTarget);
    if (item && item === this.anchor) return;

    this._hide('focus');
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

  private _showItem(
    source: tooltipSource,
    item: HTMLElement,
    point: Point | null = null,
    describedElement: HTMLElement | null = null,
  ): void {
    const content = item.getAttribute(this.contentAttribute());
    if (!content) return;

    this._show(source, {
      anchor: item,
      describedElement: describedElement ?? item,
      content,
      data: null,
      point,
    });
  }
}
