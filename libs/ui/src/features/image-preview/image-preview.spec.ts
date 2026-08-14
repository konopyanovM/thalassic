import { Direction, Directionality } from '@angular/cdk/bidi';
import { ApplicationRef, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImagePreviewService } from './image-preview.service';
import { ImagePreviewDirective } from './image-preview.directive';
import { ImagePreviewGroupDirective } from './image-preview-group.directive';

interface PointerOptions {
  x: number;
  y: number;
  timeStamp?: number;
}

// jsdom ships no full PointerEvent implementation, so pointer events are built
// from MouseEvent with the pointer fields defined on the instance.
function createPointerEvent(type: string, options: PointerOptions): PointerEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: options.x,
    clientY: options.y,
    button: 0,
  });

  Object.defineProperties(event, {
    pointerId: { value: 1 },
    pointerType: { value: 'touch' },
    isPrimary: { value: true },
    timeStamp: { value: options.timeStamp ?? 0 },
  });

  return event as unknown as PointerEvent;
}

const IMAGES = [
  { src: 'first.jpg', alt: 'First', caption: 'The first image' },
  { src: 'second.jpg', alt: 'Second' },
  { src: 'third.jpg', alt: 'Third' },
];

@Component({
  imports: [ImagePreviewDirective, ImagePreviewGroupDirective],
  template: `
    <div tlsImagePreviewGroup>
      <img tlsImagePreview src="first.jpg" alt="First" />
      <img [tlsImagePreview]="'second-full.jpg'" src="second.jpg" alt="Second" />
      <img tlsImagePreview tlsImagePreviewCaption="Third caption" src="third.jpg" alt="Third" />
    </div>

    <img class="lone" tlsImagePreview src="lone.jpg" alt="Lone" />

    <a class="link" tlsImagePreview href="linked-full.jpg">
      <img src="linked.jpg" alt="Linked" />
    </a>
  `,
})
class HostComponent {}

describe('ImagePreview', () => {
  let service: ImagePreviewService;

  beforeEach(async () => {
    Element.prototype.setPointerCapture = () => undefined;
    Element.prototype.releasePointerCapture = () => undefined;
    Element.prototype.hasPointerCapture = () => true;

    await TestBed.configureTestingModule({}).compileComponents();
    service = TestBed.inject(ImagePreviewService);
  });

  afterEach(async () => {
    service.closeAll();
    await settle();
    useDirection('ltr');
    vi.unstubAllGlobals();
  });

  // CDK resolves the layout direction once, into a root-provided `Directionality`
  // that every overlay reads, so a test flips that rather than the `dir`
  // attribute it was seeded from.
  function useDirection(direction: Direction): void {
    TestBed.inject(Directionality).valueSignal.set(direction);
  }

  function flush(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  // The exit animation hands off through an animation frame, so a closure is
  // only observable after one has passed.
  async function settle(): Promise<void> {
    flush();
    await new Promise<void>(resolve => setTimeout(resolve, 32));
    flush();
  }

  function viewer(): HTMLElement | null {
    return document.querySelector('tls-image-preview');
  }

  function image(): HTMLImageElement {
    return document.querySelector('.tls-image-preview__image') as HTMLImageElement;
  }

  function counter(): HTMLElement | null {
    return document.querySelector('.tls-image-preview__counter');
  }

  function button(label: string): HTMLButtonElement {
    return document.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
  }

  function pressKey(key: string): void {
    const element = viewer();
    if (!element) throw new Error('The viewer is not open.');

    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    flush();
  }

  function stage(): HTMLElement {
    return document.querySelector('.tls-image-preview__stage') as HTMLElement;
  }

  // Drags the stage far enough for the gesture to lock and commit as a swipe.
  function swipe(travel: number): void {
    const element = stage();

    element.dispatchEvent(createPointerEvent('pointerdown', { x: 0, y: 0, timeStamp: 0 }));
    element.dispatchEvent(
      createPointerEvent('pointermove', { x: travel / 2, y: 0, timeStamp: 300 }),
    );
    element.dispatchEvent(createPointerEvent('pointermove', { x: travel, y: 0, timeStamp: 600 }));
    element.dispatchEvent(createPointerEvent('pointerup', { x: travel, y: 0, timeStamp: 900 }));
    flush();
  }

  // Collects what the preloader fetches; a bare `Image` is all it uses.
  function trackPreloads(): string[] {
    const requested: string[] = [];

    vi.stubGlobal(
      'Image',
      class {
        set src(value: string) {
          requested.push(value);
        }
      },
    );

    return requested;
  }

  function scale(): number {
    const match = /scale\(([\d.]+)\)/.exec(image().style.transform);
    if (!match) throw new Error(`No scale in transform "${image().style.transform}".`);

    return Number(match[1]);
  }

  it('renders the image it is opened with', () => {
    service.open({ images: IMAGES });
    flush();

    expect(viewer()).not.toBeNull();
    expect(image().getAttribute('src')).toBe('first.jpg');
    expect(image().getAttribute('alt')).toBe('First');
  });

  it('starts at the requested index, clamped to the list', () => {
    service.open({ images: IMAGES, startIndex: 9 });
    flush();

    expect(image().getAttribute('src')).toBe('third.jpg');
  });

  it('shows the caption and describes the image with it', () => {
    service.open({ images: IMAGES });
    flush();

    const caption = document.querySelector('.tls-image-preview__caption');
    if (!caption) throw new Error('The caption is missing.');

    expect(caption.textContent).toContain('The first image');
    expect(image().getAttribute('aria-describedby')).toBe(caption.getAttribute('id'));
  });

  it('counts the position within the group', () => {
    service.open({ images: IMAGES });
    flush();

    const element = counter();
    if (!element) throw new Error('The counter is missing.');

    expect(element.textContent).toContain('1 / 3');
  });

  it('shows no counter or navigation for a single image', () => {
    service.open({ images: 'lone.jpg' });
    flush();

    expect(counter()).toBeNull();
    expect(document.querySelector('.tls-image-preview__navigation')).toBeNull();
  });

  it('pages through the images with the navigation controls', () => {
    service.open({ images: IMAGES });
    flush();

    button('Next image').click();
    flush();
    expect(image().getAttribute('src')).toBe('second.jpg');

    button('Previous image').click();
    flush();
    expect(image().getAttribute('src')).toBe('first.jpg');
  });

  it('wraps around the ends while looping', () => {
    service.open({ images: IMAGES });
    flush();

    pressKey('ArrowLeft');
    expect(image().getAttribute('src')).toBe('third.jpg');

    pressKey('ArrowRight');
    expect(image().getAttribute('src')).toBe('first.jpg');
  });

  it('stops at the ends without looping', () => {
    service.open({ images: IMAGES, loop: false });
    flush();

    pressKey('ArrowLeft');
    expect(image().getAttribute('src')).toBe('first.jpg');
    expect(button('Previous image').disabled).toBe(true);

    pressKey('End');
    expect(image().getAttribute('src')).toBe('third.jpg');
    expect(button('Next image').disabled).toBe(true);
  });

  it('mirrors the horizontal arrow keys in RTL', () => {
    useDirection('rtl');
    service.open({ images: IMAGES });
    flush();

    pressKey('ArrowLeft');
    expect(image().getAttribute('src')).toBe('second.jpg');

    pressKey('ArrowRight');
    expect(image().getAttribute('src')).toBe('first.jpg');
  });

  it('zooms with the keyboard, clamped to the configured bounds', () => {
    service.open({ images: IMAGES, zoomStep: 2, maxZoom: 4 });
    flush();

    expect(scale()).toBe(1);

    pressKey('+');
    expect(scale()).toBe(2);

    pressKey('+');
    pressKey('+');
    expect(scale()).toBe(4);

    pressKey('-');
    expect(scale()).toBe(2);

    pressKey('0');
    expect(scale()).toBe(1);
  });

  it('zooms on the wheel', () => {
    service.open({ images: IMAGES });
    flush();

    const stage = document.querySelector('.tls-image-preview__stage') as HTMLElement;
    stage.dispatchEvent(new WheelEvent('wheel', { deltaY: -400, bubbles: true }));
    flush();

    expect(scale()).toBeGreaterThan(1);
  });

  it('leaves the wheel and the zoom controls out when zooming is off', () => {
    service.open({ images: IMAGES, zoomable: false });
    flush();

    const stage = document.querySelector('.tls-image-preview__stage') as HTMLElement;
    stage.dispatchEvent(new WheelEvent('wheel', { deltaY: -400, bubbles: true }));
    flush();

    expect(scale()).toBe(1);
    expect(document.querySelector('button[aria-label="Zoom in"]')).toBeNull();
  });

  it('resets the zoom when another image is shown', () => {
    service.open({ images: IMAGES, zoomStep: 2 });
    flush();

    pressKey('+');
    expect(scale()).toBe(2);

    pressKey('ArrowRight');
    expect(scale()).toBe(1);
  });

  it('pages through the gallery on a horizontal swipe', () => {
    service.open({ images: IMAGES });
    flush();

    swipe(-120);
    expect(image().getAttribute('src')).toBe('second.jpg');

    swipe(120);
    expect(image().getAttribute('src')).toBe('first.jpg');
  });

  it('mirrors the swipe direction in RTL', () => {
    useDirection('rtl');
    service.open({ images: IMAGES });
    flush();

    // Toward the layout start, which is the right edge in RTL.
    swipe(120);
    expect(image().getAttribute('src')).toBe('second.jpg');
  });

  it('leaves a drag to panning once the image is zoomed', () => {
    service.open({ images: IMAGES, zoomStep: 2 });
    flush();

    pressKey('+');
    swipe(-120);

    expect(image().getAttribute('src')).toBe('first.jpg');
  });

  it('preloads the images on either side once the current one settles', () => {
    const requested = trackPreloads();
    service.open({ images: IMAGES });
    flush();

    image().dispatchEvent(new Event('load'));
    flush();

    // Neighbours of the first image, wrapping around to the last one.
    expect(requested).toEqual(['second.jpg', 'third.jpg']);

    // Already fetched, so stepping onto one of them re-requests nothing but the
    // neighbour it has not seen.
    requested.length = 0;
    pressKey('ArrowRight');
    image().dispatchEvent(new Event('load'));
    flush();

    expect(requested).toEqual([]);
  });

  it('preloads nothing for a single image', () => {
    const requested = trackPreloads();
    service.open({ images: 'lone.jpg' });
    flush();

    image().dispatchEvent(new Event('load'));
    flush();

    expect(requested).toEqual([]);
  });

  it('closes on Escape, on the close button and on a click outside the image', async () => {
    for (const dismiss of [
      () => pressKey('Escape'),
      () => button('Close image preview').click(),
      () => (document.querySelector('.tls-image-preview__stage') as HTMLElement).click(),
    ]) {
      const previewRef = service.open({ images: IMAGES });
      flush();

      const closed = vi.fn();
      previewRef.closed.subscribe(closed);

      dismiss();
      await settle();

      expect(closed).toHaveBeenCalled();
    }
  });

  it('keeps the viewer open for a click on the image itself', async () => {
    const previewRef = service.open({ images: IMAGES });
    flush();

    const element = image();
    // jsdom lays nothing out, so the photo reports an empty box and every point
    // would count as outside it.
    element.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        right: 100,
        bottom: 100,
        toJSON: () => ({}),
      }) as DOMRect;

    const closed = vi.fn();
    previewRef.closed.subscribe(closed);

    element.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 50, clientY: 50 }));
    await settle();

    expect(closed).not.toHaveBeenCalled();
  });

  it('closes on Escape even when the scrim click is off', async () => {
    const previewRef = service.open({ images: IMAGES, backdropClose: false });
    flush();

    const closed = vi.fn();
    previewRef.closed.subscribe(closed);

    (document.querySelector('.tls-image-preview__stage') as HTMLElement).click();
    await settle();
    expect(closed).not.toHaveBeenCalled();

    pressKey('Escape');
    await settle();
    expect(closed).toHaveBeenCalled();
  });

  it('leaves Escape inert when escape dismissal is off', async () => {
    const previewRef = service.open({ images: IMAGES, escapeClose: false });
    flush();

    const closed = vi.fn();
    previewRef.closed.subscribe(closed);

    pressKey('Escape');
    await settle();

    expect(closed).not.toHaveBeenCalled();
  });

  it('refuses to open without an image to show', () => {
    expect(() => service.open({ images: [] })).toThrow(/at least one image/);
    expect(() => service.open({ images: '' })).toThrow(/at least one image/);
  });

  it('tracks the shown image on the ref', () => {
    const previewRef = service.open({ images: IMAGES });
    flush();

    expect(previewRef.index).toBe(0);

    previewRef.goTo(2);
    flush();

    expect(previewRef.index).toBe(2);
    expect(image().getAttribute('src')).toBe('third.jpg');
  });
});

describe('ImagePreviewDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let service: ImagePreviewService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    service = TestBed.inject(ImagePreviewService);
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    service.closeAll();
  });

  // A bound `[tlsImagePreview]` leaves no attribute behind, so the group's members
  // are read from the group element rather than matched on the directive's selector.
  function triggers(): HTMLImageElement[] {
    return [...fixture.nativeElement.querySelectorAll('[tlsImagePreviewGroup] img')];
  }

  it('gives a host without native button semantics keyboard access', () => {
    const [trigger] = triggers();

    expect(trigger.getAttribute('role')).toBe('button');
    expect(trigger.getAttribute('tabindex')).toBe('0');
  });

  it('previews the host image when no source is given', () => {
    const open = vi.spyOn(service, 'open');
    const lone = fixture.nativeElement.querySelector('.lone') as HTMLImageElement;

    lone.click();

    expect(open).toHaveBeenCalledWith({ images: [{ src: lone.src, alt: 'Lone' }] });
  });

  it('opens the surrounding group in document order, positioned on the trigger', () => {
    const open = vi.spyOn(service, 'open');
    const [, second] = triggers();

    second.click();

    expect(open).toHaveBeenCalledTimes(1);
    const config = open.mock.calls[0][0];
    expect(config.startIndex).toBe(1);
    expect(config.images).toEqual([
      { src: triggers()[0].src, alt: 'First' },
      { src: 'second-full.jpg' },
      { src: triggers()[2].src, alt: 'Third', caption: 'Third caption' },
    ]);
  });

  it('previews a link target in place of following it', () => {
    const open = vi.spyOn(service, 'open');
    const link = fixture.nativeElement.querySelector('.link') as HTMLAnchorElement;

    // A link already dispatches its own click from the keyboard, so it is left
    // with the semantics it has.
    expect(link.getAttribute('role')).toBeNull();
    expect(link.getAttribute('tabindex')).toBeNull();

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(open).toHaveBeenCalledWith({ images: [{ src: link.href }] });
    expect(event.defaultPrevented).toBe(true);
  });

  it('leaves a modified click to the browser', () => {
    const open = vi.spyOn(service, 'open');
    const link = fixture.nativeElement.querySelector('.link') as HTMLAnchorElement;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true });
    link.dispatchEvent(event);

    expect(open).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('opens from Enter and Space on a host without native button semantics', () => {
    const open = vi.spyOn(service, 'open');
    const [trigger] = triggers();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(open).toHaveBeenCalledTimes(2);
  });
});
