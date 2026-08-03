import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwipeEvent } from './pan.types';
import { SwipeDirective } from './swipe.directive';

interface PointerOptions {
  x: number;
  y: number;
  timeStamp?: number;
  pointerId?: number;
  pointerType?: string;
  isPrimary?: boolean;
  button?: number;
}

// jsdom ships no full PointerEvent implementation, so pointer events are built
// from MouseEvent with the pointer fields defined on the instance.
function createPointerEvent(type: string, options: PointerOptions): PointerEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: options.x,
    clientY: options.y,
    button: options.button ?? 0,
  });

  Object.defineProperties(event, {
    pointerId: { value: options.pointerId ?? 1 },
    pointerType: { value: options.pointerType ?? 'touch' },
    isPrimary: { value: options.isPrimary ?? true },
    timeStamp: { value: options.timeStamp ?? 0 },
  });

  return event as unknown as PointerEvent;
}

@Component({
  imports: [SwipeDirective],
  template: `
    <div class="swipe-host" [tlsSwipe]="enabled()" axis="x" (swipe)="swipes.push($event)"></div>
  `,
})
class HostComponent {
  readonly enabled = signal(true);
  readonly swipes: SwipeEvent[] = [];
}

describe('SwipeDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    Element.prototype.setPointerCapture = () => undefined;
    Element.prototype.releasePointerCapture = () => undefined;
    Element.prototype.hasPointerCapture = () => true;

    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    hostElement = fixture.nativeElement.querySelector('.swipe-host') as HTMLElement;
  });

  function dispatch(type: string, options: PointerOptions): void {
    hostElement.dispatchEvent(createPointerEvent(type, options));
  }

  it('emits for a long drag regardless of release velocity', () => {
    dispatch('pointerdown', { x: 0, y: 0, timeStamp: 0 });
    dispatch('pointermove', { x: 60, y: 0, timeStamp: 300 });
    dispatch('pointermove', { x: 100, y: 0, timeStamp: 600 });
    dispatch('pointerup', { x: 100, y: 0, timeStamp: 900 });

    expect(host.swipes.length).toBe(1);
    expect(host.swipes[0].direction).toBe('right');
    expect(host.swipes[0].distance).toBe(100);
  });

  it('emits for a short but fast flick', () => {
    dispatch('pointerdown', { x: 0, y: 0, timeStamp: 0 });
    dispatch('pointermove', { x: 15, y: 0, timeStamp: 10 });
    dispatch('pointermove', { x: 30, y: 0, timeStamp: 20 });
    dispatch('pointerup', { x: 30, y: 0, timeStamp: 25 });

    expect(host.swipes.length).toBe(1);
    expect(host.swipes[0].velocityX).toBeGreaterThan(0.4);
  });

  it('stays silent for a short, slow drag', () => {
    dispatch('pointerdown', { x: 0, y: 0, timeStamp: 0 });
    dispatch('pointermove', { x: 20, y: 0, timeStamp: 200 });
    dispatch('pointerup', { x: 20, y: 0, timeStamp: 400 });

    expect(host.swipes.length).toBe(0);
  });

  it('is disabled through the selector binding', () => {
    host.enabled.set(false);
    fixture.detectChanges();

    dispatch('pointerdown', { x: 0, y: 0, timeStamp: 0 });
    dispatch('pointermove', { x: 100, y: 0, timeStamp: 100 });
    dispatch('pointerup', { x: 100, y: 0, timeStamp: 150 });

    expect(host.swipes.length).toBe(0);
  });
});
