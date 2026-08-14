import { Directive } from '@angular/core';
import { ImagePreviewGroupItem } from './image-preview.types';

/**
 * Groups the `[tlsImagePreview]` triggers inside it into one gallery: opening
 * any of them previews every image in the group, starting at the one clicked,
 * with the others reachable through the viewer's navigation.
 *
 * ```html
 * <div tlsImagePreviewGroup>
 *   <img tlsImagePreview src="beach.jpg" alt="Beach" />
 *   <img tlsImagePreview src="cliff.jpg" alt="Cliff" />
 * </div>
 * ```
 */
@Directive({
  selector: '[tlsImagePreviewGroup]',
})
export class ImagePreviewGroupDirective {
  // State
  private readonly _items = new Set<ImagePreviewGroupItem>();

  // Public methods
  public register(item: ImagePreviewGroupItem): void {
    this._items.add(item);
  }

  public unregister(item: ImagePreviewGroupItem): void {
    this._items.delete(item);
  }

  /**
   * The group's members in document order, which is the order the gallery is
   * paged through. Registration order does not track the DOM — members can be
   * added, moved or removed at any time — so the order is resolved on demand.
   */
  public items(): ImagePreviewGroupItem[] {
    return [...this._items].sort((first, second) => {
      const position = first.element.compareDocumentPosition(second.element);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }
}
