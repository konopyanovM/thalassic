import { orientation } from '../../types';

export interface VirtualScrollConfig {
  /** Extent of a single item along the scroll axis, in pixels. Every item shares it. */
  itemSize: number;
  /** Buffer kept rendered beyond the viewport before more items are rendered, in pixels. */
  minBufferPx: number;
  /** Buffer rendered when the minimum is crossed, in pixels. Must be at least `minBufferPx`. */
  maxBufferPx: number;
  orientation: orientation;
  /** Keeps items rendered once scrolled past instead of recycling them. */
  appendOnly: boolean;
  /** Number of detached item views kept for reuse before they are destroyed. */
  templateCacheSize: number;
}

export const DEFAULT_VIRTUAL_SCROLL_CONFIG: VirtualScrollConfig = {
  itemSize: 48,
  minBufferPx: 200,
  maxBufferPx: 400,
  orientation: 'vertical',
  appendOnly: false,
  templateCacheSize: 20,
};
