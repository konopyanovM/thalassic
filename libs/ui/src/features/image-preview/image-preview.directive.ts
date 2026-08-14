import { Directive, ElementRef, inject, input, InputSignal, OnDestroy } from '@angular/core';
import { NATIVELY_INTERACTIVE_TAGS } from './image-preview.constants';
import { ImagePreviewService } from './image-preview.service';
import {
  ImagePreviewGroupItem,
  ImagePreviewImage,
  ImagePreviewSource,
} from './image-preview.types';
import { ImagePreviewGroupDirective } from './image-preview-group.directive';
import { ImagePreviewRef } from './image-preview-ref';
import { toImagePreviewImage } from './to-image-preview-image';

/**
 * Opens the full-screen image preview from the element it sits on — typically a
 * thumbnail. The image previewed defaults to the one the host stands for — an
 * `<img>`'s own source, a link's target — so a bare attribute is enough; pass a
 * URL or a descriptor to preview a different (usually larger) source instead.
 *
 * ```html
 * <img tlsImagePreview src="beach.jpg" alt="Beach" />
 * <a tlsImagePreview href="beach-full.jpg"><img src="beach.jpg" alt="Beach" /></a>
 * <img [tlsImagePreview]="{ src: 'beach-full.jpg', caption: 'Low tide' }" src="beach.jpg" alt="Beach" />
 * ```
 *
 * On a link the preview replaces the navigation, leaving the href as the
 * fallback for a modified click and for a page without scripting.
 *
 * Inside a `[tlsImagePreviewGroup]` the trigger opens the whole group as a
 * gallery, positioned on its own image.
 *
 * A host that is not natively interactive is given button semantics and keyboard
 * access, so an `<img>` trigger is reachable and operable without a pointer.
 */
@Directive({
  selector: '[tlsImagePreview]',
  host: {
    class: 'tls-image-preview-trigger',
    '[attr.role]': 'buttonRole',
    '[attr.tabindex]': 'tabIndex',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class ImagePreviewDirective implements ImagePreviewGroupItem, OnDestroy {
  // Injections
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _imagePreview = inject(ImagePreviewService);
  private readonly _group: ImagePreviewGroupDirective | null = inject(ImagePreviewGroupDirective, {
    optional: true,
  });

  // Inputs
  /**
   * The image to preview. Left empty, the image the host stands for is previewed:
   * an `<img>`'s own source and alternative text, or a link's target.
   */
  public readonly image: InputSignal<ImagePreviewSource | ''> = input<ImagePreviewSource | ''>('', {
    alias: 'tlsImagePreview',
  });

  /** Caption displayed beneath the image in the viewer. */
  public readonly caption: InputSignal<string | undefined> = input<string | undefined>(undefined, {
    alias: 'tlsImagePreviewCaption',
  });

  // State
  private readonly _nativelyInteractive: boolean = NATIVELY_INTERACTIVE_TAGS.includes(
    this._elementRef.nativeElement.tagName,
  );

  // A host without native button semantics is given them, so the trigger is
  // announced as a control and reachable by keyboard like any other.
  protected readonly buttonRole: string | null = this._nativelyInteractive ? null : 'button';
  protected readonly tabIndex: string | null = this._nativelyInteractive ? null : '0';

  // Accessors
  public get element(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  constructor() {
    if (this._group) this._group.register(this);
  }

  // Public methods
  /** The image this trigger contributes; an empty `src` excludes it from a group. */
  public resolveImage(): ImagePreviewImage {
    const source = this.image();
    const caption = this.caption();

    if (source) {
      const image = toImagePreviewImage(source);
      if (!caption) return image;
      return { ...image, caption };
    }

    const image = this._hostImage();
    if (!caption) return image;

    return { ...image, caption };
  }

  /** Opens the preview, or the whole group when the trigger sits in one. */
  public open(): ImagePreviewRef | null {
    const group = this._group;
    if (!group) {
      const image = this.resolveImage();
      if (!image.src) return null;

      return this._imagePreview.open({ images: [image] });
    }

    const images: ImagePreviewImage[] = [];
    let startIndex = 0;

    for (const item of group.items()) {
      const image = item.resolveImage();
      if (!image.src) continue;

      if (item === this) startIndex = images.length;
      images.push(image);
    }

    if (images.length === 0) return null;

    return this._imagePreview.open({ images, startIndex });
  }

  // Protected methods
  protected onClick(event: MouseEvent): void {
    // A modified click is the browser's own affordance — open in a new tab, save
    // the target — so it is left to the browser instead of opening the viewer.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const previewRef = this.open();

    // A link trigger previews in place of following its href; letting the
    // navigation through as well would tear the page down behind the viewer.
    if (previewRef && this._elementRef.nativeElement instanceof HTMLAnchorElement) {
      event.preventDefault();
    }
  }

  // A host given button semantics must also act on the keys a button acts on;
  // a natively interactive host already dispatches its own click.
  protected onKeydown(event: KeyboardEvent): void {
    if (this._nativelyInteractive) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    this.open();
  }

  // Private methods
  /**
   * The image the host element itself stands for: an `<img>`'s own source —
   * `currentSrc` first, so a responsive source set previews the variant actually
   * loaded — or the full-size target of a link. Any other host stands for no
   * image of its own and must be given one.
   */
  private _hostImage(): ImagePreviewImage {
    const element = this._elementRef.nativeElement;

    if (element instanceof HTMLImageElement) {
      return { src: element.currentSrc || element.src, alt: element.alt };
    }

    if (element instanceof HTMLAnchorElement) return { src: element.href };

    return { src: '' };
  }

  // Lifecycle
  public ngOnDestroy(): void {
    if (this._group) this._group.unregister(this);
  }
}
