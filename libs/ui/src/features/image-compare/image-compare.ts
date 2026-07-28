import { Directionality } from '@angular/cdk/bidi';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ImageCompareConfig } from './image-compare.config';
import { IMAGE_COMPARE_CONFIG } from './image-compare.token';
import { imageCompareOrientation } from './image-compare.types';

@Component({
  selector: 'tls-image-compare',
  imports: [],
  templateUrl: './image-compare.html',
  host: {
    '[class]': 'hostClasses()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerCancel()',
  },
})
export class ImageCompare {
  // Injections
  private readonly _config: ImageCompareConfig = inject(IMAGE_COMPARE_CONFIG);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _directionality = inject(Directionality);

  // Inputs
  public readonly orientation: InputSignal<imageCompareOrientation> = input<imageCompareOrientation>(
    this._config.orientation,
  );
  public readonly keyboardStep: InputSignal<number> = input<number>(this._config.keyboardStep);

  /**
   * Divider position as a percentage (0–100) from the layout-start edge. Two-way
   * bound so consumers can drive or persist it while interaction updates it.
   */
  public readonly position: ModelSignal<number> = model<number>(this._config.position);

  /** Accessible name for the divider slider. */
  public readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public readonly ariaLabelledby: InputSignal<string | undefined> = input<string | undefined>(
    undefined,
  );

  // State
  private readonly _handle: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('handle');

  private readonly _dragging: WritableSignal<boolean> = signal(false);

  // Computed
  protected readonly isHorizontal = computed(() => this.orientation() === 'horizontal');

  protected readonly clampedPosition = computed(() =>
    Math.min(100, Math.max(0, this.position())),
  );

  protected readonly valueNow = computed(() => Math.round(this.clampedPosition()));

  protected readonly hostClasses = computed(() => {
    const className = 'tls-image-compare';

    const array: string[] = [className];

    array.push(`${className}--${this.orientation()}`);
    if (this._dragging()) array.push(`${className}--dragging`);

    return array;
  });

  // Clip the leading (before) layer to a band running from the layout-start edge
  // to the divider. `clip-path` is physical, so resolve the inset per axis — and
  // for RTL — explicitly, since logical properties cannot express it.
  protected readonly clipPath: Signal<string> = computed(() => {
    const remainder = 100 - this.clampedPosition();

    if (!this.isHorizontal()) return `inset(0 0 ${remainder}% 0)`;

    return this._isRtl() ? `inset(0 0 0 ${remainder}%)` : `inset(0 ${remainder}% 0 0)`;
  });

  // Protected methods
  protected onPointerDown(event: PointerEvent): void {
    // Ignore non-primary mouse buttons; touch/pen report button 0.
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    event.preventDefault();

    // `preventDefault` suppresses the default focus, so focus the slider handle
    // explicitly — otherwise the arrow keys wouldn't work after a pointer drag.
    this._handle().nativeElement.focus();

    this._dragging.set(true);
    this._elementRef.nativeElement.setPointerCapture(event.pointerId);
    this._updateFromPointer(event);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this._dragging()) return;
    this._updateFromPointer(event);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this._dragging()) return;

    this._elementRef.nativeElement.releasePointerCapture(event.pointerId);
    this._dragging.set(false);
  }

  // Pointer capture is already released once the browser cancels the pointer, so
  // this only resets drag state (calling `releasePointerCapture` here can throw).
  protected onPointerCancel(): void {
    this._dragging.set(false);
  }

  protected onHandleKeydown(event: KeyboardEvent): void {
    const step = this.keyboardStep();
    const horizontal = this.isHorizontal();
    const rtl = this._isRtl();
    const current = this.clampedPosition();

    let desired: number;

    switch (event.key) {
      case 'ArrowLeft':
        if (!horizontal) return;
        desired = current + (rtl ? step : -step);
        break;
      case 'ArrowRight':
        if (!horizontal) return;
        desired = current + (rtl ? -step : step);
        break;
      case 'ArrowUp':
        if (horizontal) return;
        desired = current - step;
        break;
      case 'ArrowDown':
        if (horizontal) return;
        desired = current + step;
        break;
      case 'Home':
        desired = 0;
        break;
      case 'End':
        desired = 100;
        break;
      default:
        return;
    }

    event.preventDefault();
    this._setPosition(desired);
  }

  // Private methods
  private _isRtl(): boolean {
    return this._directionality.value === 'rtl';
  }

  private _updateFromPointer(event: PointerEvent): void {
    const rect = this._elementRef.nativeElement.getBoundingClientRect();

    let ratio: number;

    if (this.isHorizontal()) {
      if (rect.width <= 0) return;
      ratio = (event.clientX - rect.left) / rect.width;
      if (this._isRtl()) ratio = 1 - ratio;
    } else {
      if (rect.height <= 0) return;
      ratio = (event.clientY - rect.top) / rect.height;
    }

    this._setPosition(ratio * 100);
  }

  private _setPosition(value: number): void {
    this.position.set(Math.min(100, Math.max(0, value)));
  }
}
