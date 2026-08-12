import { TemplateRef } from '@angular/core';
import { Point } from '@thalassic/core';
import { color, overlayPosition } from '../../types';

export type tooltipOrigin = 'cursor' | 'element';

export type tooltipPosition = overlayPosition;

export type tooltipColor = color;

/**
 * What is asking for a tooltip. Each source is an independent reason to show one, so a tooltip
 * asked for by two of them at once survives either one ending.
 */
export type tooltipSource = 'hover' | 'focus' | 'touch';

/** A live reason to show a tooltip: which element, and what to put in it. */
export interface TooltipRequest {
  /** Element the tooltip is positioned against. */
  anchor: HTMLElement;
  /**
   * Element the tooltip describes through `aria-describedby`. It is the anchor itself unless the
   * anchor merely wraps the real control — a description is only announced on the element that
   * actually takes focus.
   */
  describedElement: HTMLElement;
  content: string | TemplateRef<unknown>;
  data: unknown;
  /**
   * Cursor position the tooltip anchors to instead of the element, when the origin is `cursor`.
   * `null` when the request came from something without a pointer, such as keyboard focus.
   */
  point: Point | null;
}

/**
 * A trigger as the shared tooltip overlay sees it. Holding the tooltip is exclusive: the owner is
 * told to let go before it is handed to anyone else, and its calls are ignored once it has.
 */
export interface TooltipOwner {
  /** Gives up the visible tooltip, leaving the anchor as if the tooltip had been hidden. */
  releaseTooltip(): void;
}
