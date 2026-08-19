import { Directionality } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FakeMediaElement } from '../../fake-media-element';
import { MediaController } from '../../media-controller';
import { formatMediaTime, MediaScrubber } from './scrubber';

@Component({
  imports: [MediaScrubber],
  providers: [MediaController],
  template: '<tls-media-scrubber />',
})
class ScrubberHost {}

const setup = (): { fixture: ComponentFixture<ScrubberHost>; media: FakeMediaElement } => {
  const fixture = TestBed.createComponent(ScrubberHost);
  const controller = fixture.debugElement.injector.get(MediaController);
  const media = new FakeMediaElement();
  controller.attach(media as unknown as HTMLMediaElement);
  media.duration = 245; // 4:05
  media.fire('durationchange');
  media.currentTime = 83; // 1:23
  media.fire('timeupdate');
  fixture.detectChanges();
  return { fixture, media };
};

describe('MediaScrubber', () => {
  it('exposes slider ARIA with a human-readable value text', () => {
    const { fixture } = setup();
    const slider = fixture.nativeElement.querySelector('[role="slider"]');

    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('245');
    expect(slider.getAttribute('aria-valuenow')).toBe('83');
    expect(slider.getAttribute('aria-valuetext')).toBe('1:23 of 4:05');
  });

  it('scrubs on pointer drag and commits on release', () => {
    const { fixture, media } = setup();
    const slider = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;
    slider.getBoundingClientRect = () => ({ left: 0, width: 100, right: 100 }) as DOMRect;
    slider.setPointerCapture = () => undefined;
    slider.releasePointerCapture = () => undefined;

    slider.dispatchEvent(new PointerEvent('pointerdown', { clientX: 50, pointerId: 1 }));
    slider.dispatchEvent(new PointerEvent('pointermove', { clientX: 75, pointerId: 1 }));
    fixture.detectChanges();
    // Mid-drag: playback timeupdates must not move the thumb.
    media.currentTime = 10;
    media.fire('timeupdate');
    fixture.detectChanges();
    const slider2 = fixture.nativeElement.querySelector('[role="slider"]');
    expect(Number(slider2.getAttribute('aria-valuenow'))).toBeCloseTo(245 * 0.75, 0);

    slider.dispatchEvent(new PointerEvent('pointerup', { clientX: 75, pointerId: 1 }));
    expect(media.currentTime).toBeCloseTo(245 * 0.75, 0);
  });

  it('ignores pointer events from a pointer other than the captured one', () => {
    const { media, fixture } = setup();
    const slider = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;
    slider.getBoundingClientRect = () => ({ left: 0, width: 100, right: 100 }) as DOMRect;
    slider.setPointerCapture = () => undefined;
    slider.releasePointerCapture = () => undefined;

    slider.dispatchEvent(new PointerEvent('pointerdown', { clientX: 50, pointerId: 1 }));
    slider.dispatchEvent(new PointerEvent('pointermove', { clientX: 90, pointerId: 2 }));
    slider.dispatchEvent(new PointerEvent('pointerup', { clientX: 90, pointerId: 2 }));
    fixture.detectChanges();

    // The second pointer neither moved the scrub position nor ended the drag;
    // the announced value is the rounded midpoint (122.5 → 123).
    const slider2 = fixture.nativeElement.querySelector('[role="slider"]');
    expect(Number(slider2.getAttribute('aria-valuenow'))).toBe(123);

    // Release commits the held midpoint — the foreign pointer's coordinates
    // never entered the scrub.
    slider.dispatchEvent(new PointerEvent('pointerup', { clientX: 75, pointerId: 1 }));
    expect(media.currentTime).toBeCloseTo(245 * 0.5, 1);
  });

  it('flips horizontal arrow keys under a right-to-left direction', () => {
    const { fixture, media } = setup();
    TestBed.inject(Directionality).valueSignal.set('rtl');
    const slider = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;

    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(media.currentTime).toBe(78);

    // Seeks update the controller's time signal optimistically, so the flipped
    // forward key steps from the just-seeked 78 back to 83.
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(media.currentTime).toBe(83);
  });
});

describe('formatMediaTime', () => {
  it('formats minutes and seconds under an hour', () => {
    expect(formatMediaTime(0)).toBe('0:00');
    expect(formatMediaTime(65)).toBe('1:05');
    expect(formatMediaTime(599)).toBe('9:59');
  });

  it('adds an hours segment with padded minutes past an hour', () => {
    expect(formatMediaTime(3600)).toBe('1:00:00');
    expect(formatMediaTime(3661)).toBe('1:01:01');
    expect(formatMediaTime(7325)).toBe('2:02:05');
  });
});
