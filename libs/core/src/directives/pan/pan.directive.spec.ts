import { Directionality } from '@angular/cdk/bidi';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanDirective } from './pan.directive';
import { panAxis, panDirection, panEdge, PanEvent } from './pan.types';

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
// from MouseEvent with the pointer fields (and a controllable timeStamp,
// which the velocity window depends on) defined on the instance.
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
  imports: [PanDirective],
  template: `
    <div
      class="pan-host"
      [tlsPan]="enabled()"
      [axis]="axis()"
      [edge]="edge()"
      (panStart)="starts.push($event)"
      (panMove)="moves.push($event)"
      (panEnd)="ends.push($event)"
      (panCancel)="onPanCancel()"
    >
      <div class="scroller" style="overflow-x: auto">
        <div class="content"></div>
      </div>
    </div>
  `,
})
class HostComponent {
  readonly enabled = signal(true);
  readonly axis = signal<panAxis>('both');
  readonly edge = signal<panEdge | null>(null);

  readonly starts: PanEvent[] = [];
  readonly moves: PanEvent[] = [];
  readonly ends: PanEvent[] = [];
  cancelCount = 0;

  onPanCancel(): void {
    this.cancelCount = this.cancelCount + 1;
  }
}

describe('PanDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let hostElement: HTMLElement;

  beforeEach(() => {
    // jsdom throws NotFoundError from the pointer-capture methods because it
    // tracks no active pointers; the gesture logic only needs them to exist.
    Element.prototype.setPointerCapture = () => undefined;
    Element.prototype.releasePointerCapture = () => undefined;
    Element.prototype.hasPointerCapture = () => true;
  });

  async function setup(direction: 'ltr' | 'rtl' = 'ltr'): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: Directionality, useValue: { value: direction } as Directionality },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    hostElement = fixture.nativeElement.querySelector('.pan-host') as HTMLElement;
    hostElement.getBoundingClientRect = () =>
      ({
        left: 0,
        right: 400,
        top: 0,
        bottom: 600,
        width: 400,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
  }

  function dispatch(type: string, options: PointerOptions): void {
    hostElement.dispatchEvent(createPointerEvent(type, options));
  }

  it('locks after the threshold and reports start, moves and end', async () => {
    await setup();

    dispatch('pointerdown', { x: 50, y: 50, timeStamp: 0 });
    // Below the 10px slop: still undecided, nothing emitted.
    dispatch('pointermove', { x: 56, y: 50, timeStamp: 10 });
    expect(host.starts.length).toBe(0);

    dispatch('pointermove', { x: 70, y: 50, timeStamp: 20 });
    expect(host.starts.length).toBe(1);
    expect(host.starts[0].direction).toBe('right');

    dispatch('pointermove', { x: 90, y: 52, timeStamp: 30 });
    expect(host.moves.length).toBe(1);
    expect(host.moves[0].deltaX).toBe(40);
    expect(host.moves[0].deltaY).toBe(2);

    dispatch('pointerup', { x: 90, y: 52, timeStamp: 40 });
    expect(host.ends.length).toBe(1);
    expect(host.ends[0].direction).toBe('right');
    expect(host.ends[0].logicalDirection).toBe('right');
  });

  it('abandons a gesture whose dominant axis is not permitted', async () => {
    await setup();
    host.axis.set('x');
    fixture.detectChanges();

    dispatch('pointerdown', { x: 50, y: 50, timeStamp: 0 });
    dispatch('pointermove', { x: 52, y: 90, timeStamp: 10 });
    dispatch('pointermove', { x: 52, y: 150, timeStamp: 20 });
    dispatch('pointerup', { x: 52, y: 150, timeStamp: 30 });

    expect(host.starts.length).toBe(0);
    expect(host.ends.length).toBe(0);

    // The abandoned gesture must not block a later, valid one.
    dispatch('pointerdown', { x: 50, y: 50, timeStamp: 100 });
    dispatch('pointermove', { x: 90, y: 50, timeStamp: 110 });
    expect(host.starts.length).toBe(1);
  });

  it('only starts within the edge zone when an edge is set', async () => {
    await setup();
    host.edge.set('start');
    fixture.detectChanges();

    dispatch('pointerdown', { x: 100, y: 50, timeStamp: 0 });
    dispatch('pointermove', { x: 180, y: 50, timeStamp: 10 });
    expect(host.starts.length).toBe(0);

    dispatch('pointerdown', { x: 10, y: 50, timeStamp: 100 });
    dispatch('pointermove', { x: 90, y: 50, timeStamp: 110 });
    expect(host.starts.length).toBe(1);
  });

  it('computes velocity from the rolling window, not the whole gesture', async () => {
    await setup();

    dispatch('pointerdown', { x: 0, y: 0, timeStamp: 0 });
    // Slow drag: 10px every 100ms (0.1 px/ms) up to x=80.
    for (let step = 1; step <= 8; step = step + 1) {
      dispatch('pointermove', { x: step * 10, y: 0, timeStamp: step * 100 });
    }
    // Late flick: 4.5 px/ms over the final 20ms.
    dispatch('pointermove', { x: 120, y: 0, timeStamp: 810 });
    dispatch('pointerup', { x: 170, y: 0, timeStamp: 820 });

    expect(host.ends.length).toBe(1);
    // Whole-gesture average would be ~0.2 px/ms; the window must report the flick.
    expect(host.ends[0].velocityX).toBeGreaterThan(3);
  });

  it('emits panCancel on pointercancel and resets for the next gesture', async () => {
    await setup();

    dispatch('pointerdown', { x: 50, y: 50, timeStamp: 0 });
    dispatch('pointermove', { x: 90, y: 50, timeStamp: 10 });
    expect(host.starts.length).toBe(1);

    dispatch('pointercancel', { x: 90, y: 50, timeStamp: 20 });
    expect(host.cancelCount).toBe(1);
    expect(host.ends.length).toBe(0);

    dispatch('pointerdown', { x: 50, y: 50, timeStamp: 100 });
    dispatch('pointermove', { x: 90, y: 50, timeStamp: 110 });
    expect(host.starts.length).toBe(2);
  });

  it('bails when a scrollable ancestor can still scroll in the locked direction', async () => {
    await setup();

    const scroller = fixture.nativeElement.querySelector('.scroller') as HTMLElement;
    const content = fixture.nativeElement.querySelector('.content') as HTMLElement;
    Object.defineProperty(scroller, 'scrollWidth', { value: 500, configurable: true });
    Object.defineProperty(scroller, 'clientWidth', { value: 200, configurable: true });
    Object.defineProperty(scroller, 'scrollLeft', { value: 0, configurable: true, writable: true });

    // Finger left = scroll toward the end; the scroller has room, so it wins.
    content.dispatchEvent(createPointerEvent('pointerdown', { x: 100, y: 50, timeStamp: 0 }));
    content.dispatchEvent(createPointerEvent('pointermove', { x: 60, y: 50, timeStamp: 10 }));
    expect(host.starts.length).toBe(0);

    // Fully scrolled to the end: no room left, the gesture may proceed.
    scroller.scrollLeft = 300;
    content.dispatchEvent(createPointerEvent('pointerdown', { x: 100, y: 50, timeStamp: 100 }));
    content.dispatchEvent(createPointerEvent('pointermove', { x: 60, y: 50, timeStamp: 110 }));
    expect(host.starts.length).toBe(1);
  });

  it('ignores secondary pointers while a gesture is active', async () => {
    await setup();

    dispatch('pointerdown', { x: 50, y: 50, timeStamp: 0 });
    dispatch('pointermove', { x: 90, y: 50, timeStamp: 10 });
    expect(host.starts.length).toBe(1);

    dispatch('pointerdown', { x: 200, y: 200, timeStamp: 20, pointerId: 2, isPrimary: false });
    dispatch('pointermove', { x: 250, y: 200, timeStamp: 30, pointerId: 2, isPrimary: false });
    dispatch('pointerup', { x: 250, y: 200, timeStamp: 40, pointerId: 2, isPrimary: false });
    expect(host.moves.length).toBe(0);
    expect(host.ends.length).toBe(0);

    dispatch('pointermove', { x: 120, y: 50, timeStamp: 50 });
    expect(host.moves.length).toBe(1);

    dispatch('pointerup', { x: 120, y: 50, timeStamp: 60 });
    expect(host.ends.length).toBe(1);
  });

  it('suspends text selection while locked and restores it on release', async () => {
    await setup();

    dispatch('pointerdown', { x: 50, y: 50, timeStamp: 0 });
    dispatch('pointermove', { x: 90, y: 50, timeStamp: 10 });
    expect(document.body.style.userSelect).toBe('none');

    dispatch('pointerup', { x: 90, y: 50, timeStamp: 20 });
    expect(document.body.style.userSelect).toBe('');
  });

  it('cancels an active gesture when disabled mid-drag', async () => {
    await setup();

    dispatch('pointerdown', { x: 50, y: 50, timeStamp: 0 });
    dispatch('pointermove', { x: 90, y: 50, timeStamp: 10 });
    expect(host.starts.length).toBe(1);

    host.enabled.set(false);
    fixture.detectChanges();

    dispatch('pointermove', { x: 120, y: 50, timeStamp: 20 });
    expect(host.cancelCount).toBe(1);
    expect(host.moves.length).toBe(0);
    expect(document.body.style.userSelect).toBe('');
  });

  it('does nothing while disabled', async () => {
    await setup();
    host.enabled.set(false);
    fixture.detectChanges();

    dispatch('pointerdown', { x: 50, y: 50, timeStamp: 0 });
    dispatch('pointermove', { x: 150, y: 50, timeStamp: 10 });
    dispatch('pointerup', { x: 150, y: 50, timeStamp: 20 });

    expect(host.starts.length).toBe(0);
    expect(host.ends.length).toBe(0);
  });

  describe('in RTL', () => {
    it('flips logicalDirection on the horizontal axis', async () => {
      await setup('rtl');

      dispatch('pointerdown', { x: 200, y: 50, timeStamp: 0 });
      dispatch('pointermove', { x: 260, y: 50, timeStamp: 10 });
      dispatch('pointerup', { x: 260, y: 50, timeStamp: 20 });

      expect(host.ends.length).toBe(1);
      expect(host.ends[0].direction).toBe('right' satisfies panDirection);
      expect(host.ends[0].logicalDirection).toBe('left' satisfies panDirection);
    });

    it('resolves edge "start" to the right edge', async () => {
      await setup('rtl');
      host.edge.set('start');
      fixture.detectChanges();

      dispatch('pointerdown', { x: 10, y: 50, timeStamp: 0 });
      dispatch('pointermove', { x: 90, y: 50, timeStamp: 10 });
      expect(host.starts.length).toBe(0);

      dispatch('pointerdown', { x: 390, y: 50, timeStamp: 100 });
      dispatch('pointermove', { x: 310, y: 50, timeStamp: 110 });
      expect(host.starts.length).toBe(1);
    });
  });
});
