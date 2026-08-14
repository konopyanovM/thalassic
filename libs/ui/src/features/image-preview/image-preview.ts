import { Directionality } from '@angular/cdk/bidi';
import { DIALOG_DATA, DialogRef as CdkDialogRef } from '@angular/cdk/dialog';
import {
  Component,
  computed,
  ElementRef,
  inject,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { DEFAULT_PAN_CONFIG, PAN_CONFIG, SwipeDirective, SwipeEvent } from '@thalassic/core';
import { afterLeaveAnimation } from '../../abstract/overlay';
import { Button } from '../button';
import { Icon, systemIcon } from '../icon';
import { Loader } from '../loader';
import { ImagePreviewConfig } from './image-preview.config';
import {
  FIT_ZOOM,
  GESTURE_SLOP,
  WHEEL_LINE_HEIGHT,
  WHEEL_PAGE_HEIGHT,
  WHEEL_ZOOM_FACTOR,
} from './image-preview.constants';
import { IMAGE_PREVIEW_CONFIG } from './image-preview.token';
import { ImagePreviewData, ImagePreviewImage } from './image-preview.types';

interface ImagePreviewPoint {
  x: number;
  y: number;
}

type imagePreviewStatus = 'loading' | 'loaded' | 'error';

/**
 * Full-screen viewer for one image or a gallery of them, with zoom, pan and
 * navigation. Opened through {@link ImagePreviewService} — either directly or
 * by the `[tlsImagePreview]` trigger — never placed in a template.
 *
 * Zoom is expressed as a multiple of the fitted size, so `1` is the whole image
 * inside the viewport and the pan offset is meaningful only above it.
 */
@Component({
  selector: 'tls-image-preview',
  templateUrl: './image-preview.html',
  imports: [Button, Icon, Loader, SwipeDirective],
  providers: [
    {
      // The stage owns every touch on it — zoom, pan, swipe — so the gesture must
      // not claim an axis back for native scrolling; the stage's own
      // `touch-action` covers it. Configured through the token because
      // `SwipeDirective` forwards no `manageTouchAction` input to bind.
      provide: PAN_CONFIG,
      useValue: { ...DEFAULT_PAN_CONFIG, axis: 'x', manageTouchAction: false },
    },
  ],
  host: {
    // Focusable programmatically but not by tabbing: the surface receives the
    // initial focus so its keyboard shortcuts work, while Tab still walks its controls.
    tabindex: '-1',
    '[class]': 'hostClasses()',
    '(keydown)': 'onKeydown($event)',
    '(click)': 'onSurfaceClick($event)',
  },
})
export class ImagePreview {
  // Injections
  private static _nextUniqueId = 0;

  private readonly _config: ImagePreviewConfig = inject(IMAGE_PREVIEW_CONFIG);
  private readonly _data: ImagePreviewData = inject(DIALOG_DATA);
  private readonly _cdkDialogRef: CdkDialogRef<void, ImagePreview> = inject(CdkDialogRef);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _directionality = inject(Directionality);

  // State
  private readonly _stage: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly _image: Signal<ElementRef<HTMLImageElement>> =
    viewChild.required<ElementRef<HTMLImageElement>>('image');

  private readonly _uniqueId = `tls-image-preview-${ImagePreview._nextUniqueId++}`;

  private readonly _index: WritableSignal<number> = signal(this._data.startIndex);
  private readonly _zoom: WritableSignal<number> = signal(this._fitZoom());
  private readonly _offset: WritableSignal<ImagePreviewPoint> = signal({ x: 0, y: 0 });
  private readonly _status: WritableSignal<imagePreviewStatus> = signal('loading');
  private readonly _panning: WritableSignal<boolean> = signal(false);
  private readonly _state: WritableSignal<'enter' | 'leave'> = signal('enter');

  /** Active pointers over the stage, keyed by pointer id, for pan and pinch tracking. */
  private readonly _pointers = new Map<number, ImagePreviewPoint>();

  /** Sources already requested by the preloader, so each is fetched at most once. */
  private readonly _preloaded = new Set<string>();

  private _lastPointer: ImagePreviewPoint | null = null;
  private _pressOrigin: ImagePreviewPoint | null = null;
  private _gestured = false;
  private _pinchStartDistance = 0;
  private _pinchStartZoom = 1;
  private _closing = false;

  // Computed
  public readonly index: Signal<number> = this._index.asReadonly();

  protected readonly current: Signal<ImagePreviewImage> = computed(
    () => this._data.images[this._index()],
  );

  protected readonly total: Signal<number> = computed(() => this._data.images.length);

  protected readonly multiple: Signal<boolean> = computed(() => this.total() > 1);

  protected readonly canGoPrevious: Signal<boolean> = computed(
    () => this._config.loop || this._index() > 0,
  );

  protected readonly canGoNext: Signal<boolean> = computed(
    () => this._config.loop || this._index() < this.total() - 1,
  );

  protected readonly status: Signal<imagePreviewStatus> = this._status.asReadonly();

  /** Whether the image is enlarged past its fitted size, which is what makes it pannable. */
  protected readonly zoomed: Signal<boolean> = computed(() => this._zoom() > this._fitZoom());

  protected readonly canZoomIn: Signal<boolean> = computed(
    () => this._zoom() < this._config.maxZoom,
  );

  protected readonly canZoomOut: Signal<boolean> = computed(
    () => this._zoom() > this._config.minZoom,
  );

  /**
   * Whether a horizontal drag pages through the gallery. A zoomed image spends
   * the gesture on panning instead, since it no longer fits the viewport.
   */
  protected readonly swipeEnabled: Signal<boolean> = computed(
    () => this.multiple() && !this.zoomed(),
  );

  protected readonly transform: Signal<string> = computed(() => {
    const offset = this._offset();
    return `translate(${offset.x}px, ${offset.y}px) scale(${this._zoom()})`;
  });

  protected readonly counterText: Signal<string> = computed(() =>
    this._config.labels.counter
      .replace('{index}', String(this._index() + 1))
      .replace('{total}', String(this.total())),
  );

  protected readonly captionId: Signal<string | null> = computed(() => {
    const caption = this.current().caption;
    if (!caption) return null;
    return `${this._uniqueId}-caption`;
  });

  // The chevrons point at the physical direction travelled, which mirrors along
  // with the layout: in RTL the previous image sits to the right of the current one.
  protected readonly previousIcon: Signal<systemIcon> = computed(() =>
    this._isRtl() ? 'chevron-right' : 'chevron-left',
  );

  protected readonly nextIcon: Signal<systemIcon> = computed(() =>
    this._isRtl() ? 'chevron-left' : 'chevron-right',
  );

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = 'tls-image-preview';

    const array: string[] = [className, `${className}--${this._state()}`];

    if (this.zoomed()) array.push(`${className}--zoomed`);
    if (this._panning()) array.push(`${className}--panning`);

    return array;
  });

  // Accessors
  protected get config(): ImagePreviewConfig {
    return this._config;
  }

  // Public methods
  /** Plays the exit animation, then disposes the overlay once it finishes. */
  public animatedClose(): void {
    if (this._closing) return;
    this._closing = true;

    this._state.set('leave');
    afterLeaveAnimation(this._elementRef.nativeElement, () => this._cdkDialogRef.close());
  }

  /** Shows the image at `index`, wrapping around when the config allows looping. */
  public goTo(index: number): void {
    const total = this.total();
    if (total === 0) return;

    let target = index;

    if (target < 0 || target > total - 1) {
      if (!this._config.loop) return;
      target = ((target % total) + total) % total;
    }

    if (target === this._index()) return;

    this._index.set(target);
    this._status.set('loading');
    this.resetZoom();
  }

  public previous(): void {
    this.goTo(this._index() - 1);
  }

  public next(): void {
    this.goTo(this._index() + 1);
  }

  public resetZoom(): void {
    this._zoom.set(this._fitZoom());
    this._offset.set({ x: 0, y: 0 });
  }

  // Protected methods
  protected close(): void {
    this.animatedClose();
  }

  protected zoomIn(): void {
    this._zoomToCentre(this._zoom() * this._config.zoomStep);
  }

  protected zoomOut(): void {
    this._zoomToCentre(this._zoom() / this._config.zoomStep);
  }

  protected onImageLoad(): void {
    this._status.set('loaded');
    this._preloadNeighbours();
  }

  protected onImageError(): void {
    this._status.set('error');
    // The neighbours are worth having even when this one is broken — the next
    // step through the gallery is exactly where the reader is headed.
    this._preloadNeighbours();
  }

  protected onSwipe(event: SwipeEvent): void {
    // A pinch that ends in a flick reaches here having already zoomed in, where a
    // gesture belongs to the image rather than the gallery.
    if (!this.multiple() || this.zoomed()) return;

    // The photo travels with the finger, so dragging it toward the layout start
    // pulls the next image in from the end, the way a filmstrip moves.
    if (event.logicalDirection === 'left') this.next();
    else if (event.logicalDirection === 'right') this.previous();
  }

  // A click that lands on the stage itself — the scrim around the image and the
  // controls — dismisses the viewer, the full-screen equivalent of a backdrop
  // click. Bound on the host rather than the stage because the scrim is not a
  // control: it takes no focus and offers no keyboard path of its own, Escape
  // being the keyboard equivalent of the gesture.
  protected onSurfaceClick(event: MouseEvent): void {
    // A pan or pinch that travels off the image still ends in a click on the
    // stage, which must not be read as a dismissing click on the scrim.
    if (this._gestured) {
      this._gestured = false;
      return;
    }

    if (!this._config.backdropClose) return;

    // Anything else the click could land on is a control, which acts on its own.
    const target = event.target;
    if (target !== this._stage().nativeElement && target !== this._image().nativeElement) return;

    // The dismissing area is the scrim around the photo, hit-tested against the
    // photo's box rather than read off the target: while the stage holds the
    // pointer capture of a pan, the browser retargets the click to it, so a click
    // on the photo would otherwise look like one on the scrim.
    if (this._isOverImage(event.clientX, event.clientY)) return;

    this.animatedClose();
  }

  protected onWheel(event: WheelEvent): void {
    if (!this._config.zoomable) return;

    // The viewer owns the whole viewport, so the wheel zooms rather than scrolls.
    event.preventDefault();

    const delta = this._wheelDeltaInPixels(event);
    this._zoomToPoint(this._zoom() * Math.exp(-delta * WHEEL_ZOOM_FACTOR), event);
  }

  protected onDoubleClick(event: MouseEvent): void {
    if (!this._config.zoomable) return;

    const target = this.zoomed() ? this._fitZoom() : this._config.doubleClickZoom;
    this._zoomToPoint(target, event);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this._config.zoomable) return;
    // Ignore non-primary mouse buttons; touch and pen report button 0.
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this._pressOrigin = { x: event.clientX, y: event.clientY };
    this._gestured = false;
    this._stage().nativeElement.setPointerCapture(event.pointerId);

    if (this._pointers.size === 2) {
      this._startPinch();
      return;
    }

    if (!this.zoomed()) return;

    this._panning.set(true);
    this._lastPointer = { x: event.clientX, y: event.clientY };
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this._pointers.has(event.pointerId)) return;

    this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this._trackGesture(event);

    if (this._pointers.size >= 2) {
      this._updatePinch();
      return;
    }

    const last = this._lastPointer;
    if (!this._panning() || !last) return;

    this._panBy(event.clientX - last.x, event.clientY - last.y);
    this._lastPointer = { x: event.clientX, y: event.clientY };
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this._pointers.has(event.pointerId)) return;

    const stage = this._stage().nativeElement;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);

    this._pointers.delete(event.pointerId);
    this._panning.set(false);
    this._lastPointer = null;

    // A pinch that loses one finger continues as a pan from the remaining one.
    const [remaining] = this._pointers.values();
    if (remaining && this.zoomed()) {
      this._panning.set(true);
      this._lastPointer = { ...remaining };
    }
  }

  // The browser has already released the capture by the time a pointer is
  // cancelled, so this only drops the tracking state (releasing it here can throw).
  protected onPointerCancel(event: PointerEvent): void {
    this._pointers.delete(event.pointerId);
    this._panning.set(false);
    this._lastPointer = null;
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        if (!this._config.escapeClose) return;
        this.animatedClose();
        break;
      case 'ArrowLeft':
        if (!this.multiple()) return;
        if (this._isRtl()) this.next();
        else this.previous();
        break;
      case 'ArrowRight':
        if (!this.multiple()) return;
        if (this._isRtl()) this.previous();
        else this.next();
        break;
      case 'Home':
        if (!this.multiple()) return;
        this.goTo(0);
        break;
      case 'End':
        if (!this.multiple()) return;
        this.goTo(this.total() - 1);
        break;
      case '+':
      case '=':
        if (!this._config.zoomable) return;
        this.zoomIn();
        break;
      case '-':
      case '_':
        if (!this._config.zoomable) return;
        this.zoomOut();
        break;
      case '0':
        if (!this._config.zoomable) return;
        this.resetZoom();
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  // Private methods
  /**
   * Fetches the images on either side of the current one, so paging through a
   * gallery shows them at once instead of starting their download on arrival.
   * Runs once the current image has settled, leaving it the bandwidth first.
   */
  private _preloadNeighbours(): void {
    // The image that just settled is in the cache by virtue of being shown, so
    // stepping back onto it later must not re-request it.
    this._preloaded.add(this.current().src);

    const total = this.total();
    if (total < 2) return;

    for (const step of [1, -1]) {
      let index = this._index() + step;

      if (index < 0 || index > total - 1) {
        if (!this._config.loop) continue;
        index = ((index % total) + total) % total;
      }

      const { src } = this._data.images[index];
      if (this._preloaded.has(src)) continue;

      this._preloaded.add(src);
      // A bare `Image` is enough: the fetch lands in the HTTP cache, which is
      // what the `<img>` reads when the source is shown for real.
      const preloader = new Image();
      preloader.src = src;
    }
  }

  // An image that renders nothing occupies no box, so no point lies over it.
  private _isOverImage(clientX: number, clientY: number): boolean {
    const rect = this._image().nativeElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    return (
      clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    );
  }

  // A press that travels past the slop is a gesture; the click it ends with is
  // then a by-product of the gesture rather than a click on what sits under it.
  private _trackGesture(event: PointerEvent): void {
    const origin = this._pressOrigin;
    if (!origin || this._gestured) return;

    const travel = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
    if (travel > GESTURE_SLOP) this._gestured = true;
  }

  // The fitted size is where the viewer opens and what a reset returns to, kept
  // inside the configured bounds so a consumer that never zooms out below the fit
  // (or caps zoom under it) still gets a level it allows.
  private _fitZoom(): number {
    return this._clampZoom(FIT_ZOOM);
  }

  private _isRtl(): boolean {
    return this._directionality.value === 'rtl';
  }

  // `deltaY` is reported in the unit named by `deltaMode`, so convert the two
  // non-pixel modes to pixels before they drive the zoom exponent.
  private _wheelDeltaInPixels(event: WheelEvent): number {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * WHEEL_LINE_HEIGHT;
    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * WHEEL_PAGE_HEIGHT;
    return event.deltaY;
  }

  private _clampZoom(zoom: number): number {
    return Math.min(this._config.maxZoom, Math.max(this._config.minZoom, zoom));
  }

  private _zoomToCentre(zoom: number): void {
    const rect = this._stage().nativeElement.getBoundingClientRect();
    this._applyZoom(zoom, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  private _zoomToPoint(zoom: number, event: MouseEvent): void {
    this._applyZoom(zoom, event.clientX, event.clientY);
  }

  /**
   * Zooms to `zoom` while keeping the content under the given viewport point in
   * place, so the image grows out of the cursor rather than the centre.
   */
  private _applyZoom(zoom: number, clientX: number, clientY: number): void {
    const currentZoom = this._zoom();
    const nextZoom = this._clampZoom(zoom);
    if (nextZoom === currentZoom) return;

    const rect = this._stage().nativeElement.getBoundingClientRect();
    const anchor: ImagePreviewPoint = {
      x: clientX - (rect.left + rect.width / 2),
      y: clientY - (rect.top + rect.height / 2),
    };

    const ratio = nextZoom / currentZoom;
    const offset = this._offset();

    this._zoom.set(nextZoom);
    this._offset.set(
      this._clampOffset(
        {
          x: anchor.x - (anchor.x - offset.x) * ratio,
          y: anchor.y - (anchor.y - offset.y) * ratio,
        },
        nextZoom,
      ),
    );
  }

  private _panBy(deltaX: number, deltaY: number): void {
    const offset = this._offset();
    this._offset.set(
      this._clampOffset({ x: offset.x + deltaX, y: offset.y + deltaY }, this._zoom()),
    );
  }

  /**
   * Keeps the image covering the stage on each axis it overflows, and centred on
   * each axis it does not, so panning can never strand it off screen.
   */
  private _clampOffset(offset: ImagePreviewPoint, zoom: number): ImagePreviewPoint {
    const stage = this._stage().nativeElement;
    const image = this._image().nativeElement;

    // Layout size, taken before the transform, is the fitted size at zoom 1.
    const maxX = Math.max(0, (image.offsetWidth * zoom - stage.clientWidth) / 2);
    const maxY = Math.max(0, (image.offsetHeight * zoom - stage.clientHeight) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, offset.x)),
      y: Math.min(maxY, Math.max(-maxY, offset.y)),
    };
  }

  private _startPinch(): void {
    this._panning.set(false);
    this._lastPointer = null;
    this._pinchStartDistance = this._pointerDistance();
    this._pinchStartZoom = this._zoom();
  }

  private _updatePinch(): void {
    if (this._pinchStartDistance <= 0) return;

    const distance = this._pointerDistance();
    if (distance <= 0) return;

    const midpoint = this._pointerMidpoint();
    this._applyZoom(
      this._pinchStartZoom * (distance / this._pinchStartDistance),
      midpoint.x,
      midpoint.y,
    );
  }

  private _pointerDistance(): number {
    const [first, second] = [...this._pointers.values()];
    if (!first || !second) return 0;

    return Math.hypot(second.x - first.x, second.y - first.y);
  }

  private _pointerMidpoint(): ImagePreviewPoint {
    const [first, second] = [...this._pointers.values()];
    if (!first || !second) return { x: 0, y: 0 };

    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
  }
}
