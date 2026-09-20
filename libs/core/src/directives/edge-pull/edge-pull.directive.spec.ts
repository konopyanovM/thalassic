import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE,
  EDGE_PULL_DEFAULT_THRESHOLD,
  EDGE_PULL_RESISTANCE,
} from './edge-pull.constants';
import { EdgePullDirective } from './edge-pull.directive';
import { edgePullEdge } from './edge-pull.types';

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

@Component({
  imports: [EdgePullDirective],
  template: `
    <div
      class="scroller"
      style="overflow-y: auto; height: 100px"
      tlsEdgePull
      ignore=".handle"
      [start]="hasPrevious()"
      [end]="hasNext()"
      [reversible]="reversible()"
      (pulled)="pulls.push($event)"
    >
      <div class="content" style="height: 1000px">
        <span class="handle"></span>
      </div>
    </div>
  `,
})
class HostComponent {
  readonly hasPrevious = signal(true);
  readonly hasNext = signal(true);
  readonly reversible = signal(false);
  readonly pulls: edgePullEdge[] = [];
}

describe('EdgePullDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let scroller: HTMLElement;

  // A finger has to travel the threshold over the resistance for the pull to
  // reach it; a little more clears it.
  const ARMING_TRAVEL = EDGE_PULL_DEFAULT_THRESHOLD / EDGE_PULL_RESISTANCE + 10;

  // jsdom lays nothing out, so the scroll metrics the gesture reads are defined
  // on the element directly.
  const setScrollMetrics = (scrollTop: number): void => {
    Object.defineProperties(scroller, {
      scrollTop: { value: scrollTop, configurable: true, writable: true },
      scrollHeight: { value: 1000, configurable: true },
      clientHeight: { value: 100, configurable: true },
    });
  };

  // Dispatched on an element rather than the document: the gesture reads the
  // move's target to find what is under the finger.
  const drag = (deltaY: number, from: HTMLElement = scroller): void => {
    const step = Math.sign(deltaY) * 20;
    from.dispatchEvent(createPointerEvent('pointerdown', { x: 50, y: 500 }));
    from.dispatchEvent(createPointerEvent('pointermove', { x: 50, y: 500 + step, timeStamp: 16 }));
    from.dispatchEvent(
      createPointerEvent('pointermove', { x: 50, y: 500 + deltaY, timeStamp: 32 }),
    );
  };

  // A later move of a drag already under way, to a travel of its own.
  const moveTo = (deltaY: number, timeStamp: number): void => {
    scroller.dispatchEvent(createPointerEvent('pointermove', { x: 50, y: 500 + deltaY, timeStamp }));
  };

  // Nothing to scroll, so the container sits at both of its ends at once.
  const setUnscrollable = (): void => {
    Object.defineProperties(scroller, {
      scrollTop: { value: 0, configurable: true, writable: true },
      scrollHeight: { value: 100, configurable: true },
      clientHeight: { value: 100, configurable: true },
    });
  };

  const release = (deltaY: number, from: HTMLElement = scroller): void => {
    from.dispatchEvent(createPointerEvent('pointerup', { x: 50, y: 500 + deltaY, timeStamp: 48 }));
  };

  const distanceStyle = (): string => scroller.style.getPropertyValue('--tls-edge-pull-distance');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    scroller = fixture.nativeElement.querySelector('.scroller');
    scroller.setPointerCapture = () => undefined;
    scroller.hasPointerCapture = () => false;
    scroller.releasePointerCapture = () => undefined;
  });

  it('leaves the drag to the browser while the container can still scroll that way', () => {
    setScrollMetrics(400);

    drag(-ARMING_TRAVEL);
    release(-ARMING_TRAVEL);

    expect(distanceStyle()).toBe('');
    expect(host.pulls).toEqual([]);
  });

  it('follows a drag down from the top at a fraction of its travel, as a pull from the start', () => {
    setScrollMetrics(0);

    drag(100);

    expect(distanceStyle()).toBe('50px');
    expect(scroller.className).toContain('tls-edge-pull--pulling');
    expect(scroller.className).toContain('tls-edge-pull--start');
  });

  it('commits a pull released past the threshold, naming the end it left by', () => {
    setScrollMetrics(900);

    drag(-ARMING_TRAVEL);
    expect(scroller.className).toContain('tls-edge-pull--armed');
    expect(scroller.className).toContain('tls-edge-pull--end');

    release(-ARMING_TRAVEL);

    expect(host.pulls).toEqual(['end']);
    expect(scroller.className).toContain('tls-edge-pull--idle');
    expect(scroller.className).not.toContain('tls-edge-pull--end');
    expect(distanceStyle()).toBe('0px');
  });

  it('reports nothing for a pull released short of the threshold', () => {
    setScrollMetrics(0);

    drag(60);
    release(60);

    expect(host.pulls).toEqual([]);
    expect(distanceStyle()).toBe('0px');
  });

  it('is no pull towards an end with nothing past it', async () => {
    host.hasNext.set(false);
    await fixture.whenStable();
    setScrollMetrics(900);

    drag(-ARMING_TRAVEL);
    release(-ARMING_TRAVEL);

    expect(distanceStyle()).toBe('');
    expect(host.pulls).toEqual([]);
  });

  it('judges what a drag started on by where the finger came down, not where it has got to', () => {
    setScrollMetrics(0);
    const handle: HTMLElement = fixture.nativeElement.querySelector('.handle');

    // Down on the handle, but the moves arrive on the container: whatever the
    // handle belongs to has taken it out from under the finger by then.
    handle.dispatchEvent(createPointerEvent('pointerdown', { x: 50, y: 500 }));
    scroller.dispatchEvent(createPointerEvent('pointermove', { x: 50, y: 520, timeStamp: 16 }));
    scroller.dispatchEvent(
      createPointerEvent('pointermove', { x: 50, y: 500 + ARMING_TRAVEL, timeStamp: 32 }),
    );
    release(ARMING_TRAVEL);

    expect(host.pulls).toEqual([]);
    expect(distanceStyle()).toBe('');
  });

  it('is no pull when the drag starts on something ignored', () => {
    setScrollMetrics(0);
    const handle: HTMLElement = fixture.nativeElement.querySelector('.handle');

    drag(ARMING_TRAVEL, handle);
    release(ARMING_TRAVEL, handle);

    expect(host.pulls).toEqual([]);
  });

  describe('carried back past where it began', () => {
    it('only cancels by default, keeping to the end it began at', () => {
      setUnscrollable();

      drag(60);
      moveTo(-ARMING_TRAVEL, 48);

      expect(scroller.className).toContain('tls-edge-pull--start');
      expect(scroller.className).not.toContain('tls-edge-pull--end');
      expect(distanceStyle()).toBe('0px');

      release(-ARMING_TRAVEL);
      expect(host.pulls).toEqual([]);
    });

    it('changes ends when reversible, and commits to the end it was released at', async () => {
      host.reversible.set(true);
      await fixture.whenStable();
      setUnscrollable();

      drag(60);
      moveTo(-(ARMING_TRAVEL + EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE), 48);

      expect(scroller.className).toContain('tls-edge-pull--end');
      expect(scroller.className).not.toContain('tls-edge-pull--start');
      expect(scroller.className).toContain('tls-edge-pull--armed');

      release(-(ARMING_TRAVEL + EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE));
      expect(host.pulls).toEqual(['end']);
    });

    it('pulls neither end inside the dead zone, and grows the new pull from nothing past it', async () => {
      host.reversible.set(true);
      await fixture.whenStable();
      setUnscrollable();

      drag(60);
      moveTo(-(EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE - 2), 48);

      expect(scroller.className).not.toContain('tls-edge-pull--end');
      expect(distanceStyle()).toBe('0px');

      moveTo(-(EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE + 20), 64);

      expect(scroller.className).toContain('tls-edge-pull--end');
      expect(distanceStyle()).toBe(`${20 * EDGE_PULL_RESISTANCE}px`);
    });

    it('does not change to an end the container is not at', async () => {
      host.reversible.set(true);
      await fixture.whenStable();
      // Scrolled to the bottom: at its end, a long way from its start.
      setScrollMetrics(900);

      drag(-60);
      moveTo(ARMING_TRAVEL, 48);

      expect(scroller.className).not.toContain('tls-edge-pull--start');
      release(ARMING_TRAVEL);
      expect(host.pulls).toEqual([]);
    });

    it('picks up a drag that set off towards an end with nothing past it', async () => {
      host.reversible.set(true);
      host.hasPrevious.set(false);
      await fixture.whenStable();
      setUnscrollable();

      drag(60);
      expect(scroller.className).toContain('tls-edge-pull--idle');

      moveTo(-(ARMING_TRAVEL + EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE), 48);
      release(-(ARMING_TRAVEL + EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE));

      expect(host.pulls).toEqual(['end']);
    });
  });
});
