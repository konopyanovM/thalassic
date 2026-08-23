import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carousel } from './carousel';
import { CarouselSlide } from './carousel-slide';

interface PointerOptions {
  x: number;
  y: number;
  timeStamp?: number;
}

// jsdom ships no full PointerEvent implementation, so pointer events are built
// from MouseEvent with the pointer fields (and a controllable timeStamp, which
// the gesture's velocity window depends on) defined on the instance.
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

@Component({
  imports: [Carousel, CarouselSlide],
  template: `
    <tls-carousel
      [loop]="loop()"
      [autoplayInterval]="autoplayInterval()"
      [showArrows]="showArrows()"
      [showIndicators]="showIndicators()"
      [selected]="selected()"
      (selectedChange)="selected.set($event)"
      ariaLabel="Featured"
    >
      <tls-carousel-slide>
        <button type="button" (click)="contentClicks = contentClicks + 1">First</button>
      </tls-carousel-slide>
      <tls-carousel-slide><p>Second</p></tls-carousel-slide>
      <tls-carousel-slide label="Closing slide"><p>Third</p></tls-carousel-slide>
    </tls-carousel>
  `,
})
class HostComponent {
  readonly loop = signal(false);
  readonly autoplayInterval = signal(0);
  readonly showArrows = signal(true);
  readonly showIndicators = signal(true);
  readonly selected = signal(0);

  contentClicks = 0;
}

describe('Carousel', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    // jsdom throws NotFoundError from the pointer-capture methods because it
    // tracks no active pointers; the gesture logic only needs them to exist.
    Element.prototype.setPointerCapture = () => undefined;
    Element.prototype.releasePointerCapture = () => undefined;
    Element.prototype.hasPointerCapture = () => true;

    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function carouselElement(): HTMLElement {
    return fixture.nativeElement.querySelector('tls-carousel') as HTMLElement;
  }

  function viewportElement(): HTMLElement {
    return fixture.nativeElement.querySelector('.tls-carousel__viewport') as HTMLElement;
  }

  function slideElements(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.tls-carousel__slide'));
  }

  /** The interactive control inside a `tls-button` overlay control. */
  function control(modifier: string): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector(`.tls-carousel__control--${modifier} button`);
  }

  function indicators(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.tls-carousel__indicator'));
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function click(button: HTMLButtonElement | null): Promise<void> {
    button?.click();
    await settle();
  }

  /** A press that lands focus, as a browser click on a control does. */
  async function pressControl(button: HTMLButtonElement | null): Promise<void> {
    if (!button) return;

    carouselElement().dispatchEvent(createPointerEvent('pointerdown', { x: 0, y: 0 }));
    button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    document.dispatchEvent(createPointerEvent('pointerup', { x: 0, y: 0 }));
    await click(button);
  }

  /** Drags the viewport horizontally and releases, in one gesture. */
  async function drag(distance: number): Promise<void> {
    const viewport = viewportElement();
    viewport.getBoundingClientRect = () =>
      ({
        left: 0,
        right: 400,
        top: 0,
        bottom: 300,
        width: 400,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    viewport.dispatchEvent(createPointerEvent('pointerdown', { x: 200, y: 150, timeStamp: 0 }));
    // Past the slop, so the gesture locks onto the horizontal axis.
    viewport.dispatchEvent(
      createPointerEvent('pointermove', {
        x: 200 + Math.sign(distance) * 20,
        y: 150,
        timeStamp: 100,
      }),
    );
    viewport.dispatchEvent(
      createPointerEvent('pointermove', { x: 200 + distance, y: 150, timeStamp: 400 }),
    );
    viewport.dispatchEvent(
      createPointerEvent('pointerup', { x: 200 + distance, y: 150, timeStamp: 400 }),
    );
    await settle();
  }

  it('renders the carousel container and slide regions with their ARIA semantics', () => {
    const carousel = carouselElement();

    expect(carousel.getAttribute('role')).toBe('group');
    expect(carousel.getAttribute('aria-roledescription')).toBe('carousel');
    expect(carousel.getAttribute('aria-label')).toBe('Featured');

    const slides = slideElements();
    expect(slides.length).toBe(3);
    expect(slides[0].getAttribute('role')).toBe('group');
    expect(slides[0].getAttribute('aria-roledescription')).toBe('slide');
    expect(slides[0].getAttribute('aria-label')).toBe('1 of 3');
  });

  it('keeps the position in a slide accessible name built from its label', () => {
    expect(slideElements()[2].getAttribute('aria-label')).toBe('Closing slide, 3 of 3');
  });

  it('hides non-selected slides from assistive tech and interaction', () => {
    const slides = slideElements();

    expect(slides[0].hasAttribute('aria-hidden')).toBe(false);
    expect(slides[0].hasAttribute('inert')).toBe(false);
    expect(slides[1].getAttribute('aria-hidden')).toBe('true');
    expect(slides[1].hasAttribute('inert')).toBe(true);
  });

  it('moves through the slides with the arrow buttons and stops at the ends', async () => {
    await click(control('next'));
    expect(host.selected()).toBe(1);

    await click(control('next'));
    expect(host.selected()).toBe(2);

    await click(control('next'));
    expect(host.selected()).toBe(2);

    await click(control('previous'));
    expect(host.selected()).toBe(1);
  });

  it('marks an arrow at the end of the track aria-disabled but keeps it focusable', async () => {
    expect(control('previous')?.getAttribute('aria-disabled')).toBe('true');
    expect(control('previous')?.disabled).toBe(false);
    expect(control('previous')?.tabIndex).toBe(0);

    await click(control('next'));
    expect(control('previous')?.getAttribute('aria-disabled')).toBeNull();

    await click(control('next'));
    expect(control('next')?.getAttribute('aria-disabled')).toBe('true');
  });

  it('wraps around the ends while looping', async () => {
    host.loop.set(true);
    await settle();

    await click(control('previous'));
    expect(host.selected()).toBe(2);

    await click(control('next'));
    expect(host.selected()).toBe(0);
  });

  it('jumps to a slide from its indicator and marks the active one', async () => {
    const dots = indicators();
    expect(dots.length).toBe(3);
    expect(dots[0].getAttribute('aria-current')).toBe('true');
    expect(dots[2].getAttribute('aria-label')).toBe('Go to slide 3');

    await click(dots[2]);
    expect(host.selected()).toBe(2);
    expect(indicators()[2].getAttribute('aria-current')).toBe('true');
  });

  it('clamps an out-of-range selected index back into range', async () => {
    host.selected.set(10);
    await settle();

    expect(host.selected()).toBe(2);
  });

  it('hides the arrows and indicators when disabled', async () => {
    host.showArrows.set(false);
    host.showIndicators.set(false);
    await settle();

    expect(control('next')).toBeNull();
    expect(indicators().length).toBe(0);
  });

  it('shows the rotation toggle only while autoplay is configured', async () => {
    expect(control('rotation')).toBeNull();

    host.autoplayInterval.set(5000);
    await settle();

    expect(control('rotation')?.getAttribute('aria-label')).toBe('Stop slide rotation');
  });

  describe('auto-rotation', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      host.autoplayInterval.set(5000);
      await settle();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    async function tick(milliseconds: number): Promise<void> {
      vi.advanceTimersByTime(milliseconds);
      await settle();
    }

    it('advances on the interval and wraps past the last slide', async () => {
      await tick(5000);
      expect(host.selected()).toBe(1);

      await tick(5000);
      expect(host.selected()).toBe(2);

      // Rotation wraps even though `loop` is off, so the stop control never
      // describes motion that has silently ended.
      await tick(5000);
      expect(host.selected()).toBe(0);
    });

    it('gives a slide reached by hand a full interval before advancing', async () => {
      await tick(4000);
      await click(indicators()[2]);

      await tick(4000);
      expect(host.selected()).toBe(2);

      await tick(1000);
      expect(host.selected()).toBe(0);
    });

    it('stops rotating when the rotation control is pressed', async () => {
      await pressControl(control('rotation'));
      expect(control('rotation')?.getAttribute('aria-label')).toBe('Start slide rotation');

      await tick(5000);
      expect(host.selected()).toBe(0);
    });

    it('stops rotating when keyboard focus enters', async () => {
      control('next')?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await settle();

      await tick(5000);
      expect(host.selected()).toBe(0);
      expect(control('rotation')?.getAttribute('aria-label')).toBe('Start slide rotation');
    });

    it('pauses while the pointer rests on the carousel', async () => {
      carouselElement().dispatchEvent(new Event('pointerenter'));
      await settle();

      await tick(5000);
      expect(host.selected()).toBe(0);

      carouselElement().dispatchEvent(new Event('pointerleave'));
      await settle();

      await tick(5000);
      expect(host.selected()).toBe(1);
    });

    it('pauses while the page is hidden', async () => {
      const visibility = vi.spyOn(document, 'visibilityState', 'get');
      visibility.mockReturnValue('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      await settle();

      await tick(5000);
      expect(host.selected()).toBe(0);

      visibility.mockReturnValue('visible');
      document.dispatchEvent(new Event('visibilitychange'));
      await settle();

      await tick(5000);
      expect(host.selected()).toBe(1);
    });

    it('announces user-driven changes only, staying silent while rotating', async () => {
      const track = fixture.nativeElement.querySelector('.tls-carousel__track') as HTMLElement;
      expect(track.getAttribute('aria-live')).toBe('off');

      await pressControl(control('rotation'));
      expect(track.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('dragging', () => {
    it('commits to the next slide once the drag passes the threshold', async () => {
      await drag(-120);

      expect(host.selected()).toBe(1);
    });

    it('stays on the slide for a drag that falls short', async () => {
      await drag(-40);

      expect(host.selected()).toBe(0);
    });

    it('commits on a short flick', async () => {
      const viewport = viewportElement();
      viewport.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 400,
          width: 400,
          height: 300,
          top: 0,
          bottom: 300,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;

      viewport.dispatchEvent(createPointerEvent('pointerdown', { x: 200, y: 150, timeStamp: 0 }));
      viewport.dispatchEvent(createPointerEvent('pointermove', { x: 180, y: 150, timeStamp: 10 }));
      viewport.dispatchEvent(createPointerEvent('pointermove', { x: 140, y: 150, timeStamp: 30 }));
      viewport.dispatchEvent(createPointerEvent('pointerup', { x: 140, y: 150, timeStamp: 30 }));
      await settle();

      expect(host.selected()).toBe(1);
    });

    it('damps a drag at the edge of the track instead of following the finger', async () => {
      const viewport = viewportElement();
      viewport.dispatchEvent(createPointerEvent('pointerdown', { x: 200, y: 150, timeStamp: 0 }));
      viewport.dispatchEvent(createPointerEvent('pointermove', { x: 220, y: 150, timeStamp: 10 }));
      viewport.dispatchEvent(createPointerEvent('pointermove', { x: 320, y: 150, timeStamp: 400 }));

      // 100px of travel past the lock point, against an edge with no slide
      // behind it: the track follows a damped fraction of it.
      const offset = parseFloat(carouselElement().style.getPropertyValue('--tls-carousel-drag'));
      expect(offset).toBeGreaterThan(0);
      expect(offset).toBeLessThan(100);

      viewport.dispatchEvent(createPointerEvent('pointerup', { x: 320, y: 150, timeStamp: 400 }));
      await settle();

      expect(host.selected()).toBe(0);
    });

    it('gives no ground to a native content drag while there is a track to swipe', () => {
      const dragStart = new Event('dragstart', { bubbles: true, cancelable: true });
      slideElements()[0].dispatchEvent(dragStart);

      expect(dragStart.defaultPrevented).toBe(true);
    });

    it('swallows the click that concludes a drag', async () => {
      await drag(-120);

      const contentButton = slideElements()[0].querySelector('button') as HTMLButtonElement;
      contentButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await settle();

      expect(host.contentClicks).toBe(0);

      // The suppression covers that one click only.
      contentButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await settle();

      expect(host.contentClicks).toBe(1);
    });
  });
});
