import { Directionality } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FakeMediaElement } from '../../fake-media-element';
import { MediaController } from '../../media-controller';
import { MediaVolumeControl } from './volume-control';

@Component({
  imports: [MediaVolumeControl],
  providers: [MediaController],
  template: '<tls-media-volume-control />',
})
class VolumeControlHost {}

const setup = (): { fixture: ComponentFixture<VolumeControlHost>; media: FakeMediaElement } => {
  const fixture = TestBed.createComponent(VolumeControlHost);
  const controller = fixture.debugElement.injector.get(MediaController);
  const media = new FakeMediaElement();
  controller.attach(media as unknown as HTMLMediaElement);
  media.volume = 0.6;
  media.fire('volumechange');
  fixture.detectChanges();
  return { fixture, media };
};

const sliderOf = (fixture: ComponentFixture<VolumeControlHost>): HTMLElement => {
  const slider = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;
  slider.getBoundingClientRect = () => ({ left: 0, width: 100, right: 100 }) as DOMRect;
  slider.setPointerCapture = () => undefined;
  slider.releasePointerCapture = () => undefined;
  return slider;
};

describe('MediaVolumeControl', () => {
  it('toggles mute through the pressed mute button', () => {
    const { fixture, media } = setup();
    const muteButton = fixture.nativeElement.querySelector('.mute') as HTMLButtonElement;

    expect(muteButton.getAttribute('aria-pressed')).toBe('false');

    muteButton.click();
    // A real media element fires `volumechange` when `muted` is assigned; the
    // fake needs it fired explicitly for the controller's signal to update.
    media.fire('volumechange');
    fixture.detectChanges();

    expect(media.muted).toBe(true);
    expect(muteButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('announces the retained volume while muted but collapses the visual fill', () => {
    const { fixture, media } = setup();
    media.muted = true;
    media.fire('volumechange');
    fixture.detectChanges();

    const slider = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;
    expect(slider.getAttribute('aria-valuenow')).toBe('60');
    expect(slider.style.getPropertyValue('--tls-media-volume')).toBe('0');
  });

  it('sets the volume from a pointer press and drag', () => {
    const { fixture, media } = setup();
    const slider = sliderOf(fixture);

    slider.dispatchEvent(new PointerEvent('pointerdown', { clientX: 25, pointerId: 1 }));
    expect(media.volume).toBeCloseTo(0.25, 5);

    slider.dispatchEvent(new PointerEvent('pointermove', { clientX: 80, pointerId: 1 }));
    expect(media.volume).toBeCloseTo(0.8, 5);

    slider.dispatchEvent(new PointerEvent('pointerup', { clientX: 80, pointerId: 1 }));
  });

  it('ignores pointer events from a pointer other than the captured one', () => {
    const { fixture, media } = setup();
    const slider = sliderOf(fixture);

    slider.dispatchEvent(new PointerEvent('pointerdown', { clientX: 25, pointerId: 1 }));
    slider.dispatchEvent(new PointerEvent('pointermove', { clientX: 90, pointerId: 2 }));

    expect(media.volume).toBeCloseTo(0.25, 5);
  });

  it('reflects the drag through a host modifier class so the reveal survives the pointer leaving', () => {
    const { fixture } = setup();
    const host = fixture.nativeElement.querySelector('tls-media-volume-control') as HTMLElement;
    const slider = sliderOf(fixture);

    slider.dispatchEvent(new PointerEvent('pointerdown', { clientX: 25, pointerId: 1 }));
    fixture.detectChanges();
    expect(host.classList.contains('tls-media-volume-control--dragging')).toBe(true);

    slider.dispatchEvent(new PointerEvent('pointerup', { clientX: 25, pointerId: 1 }));
    fixture.detectChanges();
    expect(host.classList.contains('tls-media-volume-control--dragging')).toBe(false);
  });

  it('steps the volume with keyboard keys, unmuting on an upward step', () => {
    const { fixture, media } = setup();
    const slider = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;

    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(media.volume).toBeCloseTo(0.65, 5);

    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(media.volume).toBe(0);

    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(media.volume).toBe(1);
  });

  it('flips horizontal arrow keys under a right-to-left direction', () => {
    const { fixture, media } = setup();
    TestBed.inject(Directionality).valueSignal.set('rtl');
    const slider = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;

    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(media.volume).toBeCloseTo(0.65, 5);
  });
});
