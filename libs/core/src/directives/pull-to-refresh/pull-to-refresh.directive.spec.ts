import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  PULL_TO_REFRESH_DEFAULT_MIN_REFRESHING_TIME,
  PULL_TO_REFRESH_DEFAULT_THRESHOLD,
} from './pull-to-refresh.constants';
import { PullToRefreshDirective } from './pull-to-refresh.directive';

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
  imports: [PullToRefreshDirective],
  template: `
    <div
      class="scroller"
      style="overflow-y: auto; height: 100px"
      [tlsPullToRefresh]="enabled()"
      [refreshing]="refreshing()"
      (refresh)="refreshCount = refreshCount + 1"
    >
      <div class="content" style="height: 1000px"></div>
    </div>
  `,
})
class HostComponent {
  readonly enabled = signal(true);
  readonly refreshing = signal(false);
  refreshCount = 0;
}

@Component({
  imports: [PullToRefreshDirective],
  template: `
    <div
      class="scroller"
      style="overflow-y: auto; height: 100px"
      tlsPullToRefresh
      (refresh)="refreshCount = refreshCount + 1"
    >
      <div class="content" style="height: 1000px"></div>
    </div>
  `,
})
class MinimalHostComponent {
  refreshCount = 0;
}

describe('PullToRefreshDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let scroller: HTMLElement;

  // jsdom lays nothing out, so the scroll metrics the gesture reads are defined
  // on the element directly.
  const setScrollMetrics = (scrollTop: number): void => {
    Object.defineProperties(scroller, {
      scrollTop: { value: scrollTop, configurable: true, writable: true },
      scrollHeight: { value: 1000, configurable: true },
      clientHeight: { value: 100, configurable: true },
    });
  };

  const pull = (distance: number): void => {
    scroller.dispatchEvent(createPointerEvent('pointerdown', { x: 50, y: 50 }));
    // Dispatched on the scroller rather than the document: the gesture reads the
    // move's target to find what is under the finger, and a document target is
    // no element at all.
    scroller.dispatchEvent(createPointerEvent('pointermove', { x: 50, y: 50 + 20, timeStamp: 16 }));
    scroller.dispatchEvent(
      createPointerEvent('pointermove', { x: 50, y: 50 + distance, timeStamp: 32 }),
    );
  };

  const release = (distance: number): void => {
    scroller.dispatchEvent(
      createPointerEvent('pointerup', { x: 50, y: 50 + distance, timeStamp: 48 }),
    );
  };

  const distanceStyle = (): string => scroller.style.getPropertyValue('--tls-pull-distance');

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

  it('leaves the drag to the browser while the container can still scroll', () => {
    setScrollMetrics(200);

    pull(120);
    fixture.detectChanges();

    // Nothing was pulled, so nothing reports a pull.
    expect(distanceStyle()).toBe('');
    expect(scroller.className).toContain('tls-pull-to-refresh--idle');
  });

  it('follows the finger at a fraction of its travel once at the top', () => {
    setScrollMetrics(0);

    pull(100);
    fixture.detectChanges();

    // Half of 100, under both the cap and the threshold.
    expect(distanceStyle()).toBe('50px');
    expect(scroller.className).toContain('tls-pull-to-refresh--pulling');
  });

  it('reports nothing for a pull released short of the threshold', () => {
    setScrollMetrics(0);

    pull(40);
    fixture.detectChanges();
    expect(scroller.className).toContain('tls-pull-to-refresh--pulling');

    release(40);
    fixture.detectChanges();

    expect(host.refreshCount).toBe(0);
    expect(distanceStyle()).toBe('0px');
    expect(scroller.className).toContain('tls-pull-to-refresh--idle');
  });

  it('asks for a refresh when a pull past the threshold is released', () => {
    setScrollMetrics(0);

    pull(200);
    fixture.detectChanges();
    // Capped well short of the finger's 200px, and past the threshold.
    expect(distanceStyle()).toBe('96px');
    expect(scroller.className).toContain('tls-pull-to-refresh--armed');

    release(200);
    fixture.detectChanges();

    expect(host.refreshCount).toBe(1);
  });

  it('holds the released pull at the arming distance, not where the finger let go', () => {
    setScrollMetrics(0);
    host.refreshing.set(true);
    fixture.detectChanges();

    pull(200);
    release(200);
    fixture.detectChanges();

    expect(distanceStyle()).toBe(`${PULL_TO_REFRESH_DEFAULT_THRESHOLD}px`);
    expect(scroller.className).toContain('tls-pull-to-refresh--refreshing');
  });

  it('holds the pull open until the refresh it asked for is finished', () => {
    vi.useFakeTimers();
    setScrollMetrics(0);
    host.refreshing.set(true);
    fixture.detectChanges();

    pull(200);
    release(200);
    fixture.detectChanges();
    expect(scroller.className).toContain('tls-pull-to-refresh--refreshing');

    vi.advanceTimersByTime(PULL_TO_REFRESH_DEFAULT_MIN_REFRESHING_TIME);
    host.refreshing.set(false);
    fixture.detectChanges();

    expect(distanceStyle()).toBe('0px');
    expect(scroller.className).toContain('tls-pull-to-refresh--idle');
    vi.useRealTimers();
  });

  it('holds an instantly finished refresh open for the minimum time', () => {
    vi.useFakeTimers();
    setScrollMetrics(0);
    host.refreshing.set(true);
    fixture.detectChanges();

    pull(200);
    release(200);
    fixture.detectChanges();

    // The refresh comes back at once, but the surface stays for the hold.
    host.refreshing.set(false);
    fixture.detectChanges();
    expect(scroller.className).toContain('tls-pull-to-refresh--refreshing');

    vi.advanceTimersByTime(PULL_TO_REFRESH_DEFAULT_MIN_REFRESHING_TIME);
    fixture.detectChanges();

    expect(distanceStyle()).toBe('0px');
    expect(scroller.className).toContain('tls-pull-to-refresh--idle');
    vi.useRealTimers();
  });

  it('configures the gesture underneath to share the axis it scrolls on', () => {
    // Claiming the axis would stop the container scrolling at all, so the
    // gesture must leave `touch-action` alone.
    expect(scroller.style.getPropertyValue('touch-action')).toBe('');
  });

  it('returns the surface when nothing tracks whether the refresh is running', () => {
    vi.useFakeTimers();
    const minimalFixture = TestBed.createComponent(MinimalHostComponent);
    minimalFixture.detectChanges();
    const minimalScroller: HTMLElement =
      minimalFixture.nativeElement.querySelector('.scroller');
    minimalScroller.setPointerCapture = () => undefined;
    minimalScroller.hasPointerCapture = () => false;
    minimalScroller.releasePointerCapture = () => undefined;
    Object.defineProperties(minimalScroller, {
      scrollTop: { value: 0, configurable: true, writable: true },
      scrollHeight: { value: 1000, configurable: true },
      clientHeight: { value: 100, configurable: true },
    });

    minimalScroller.dispatchEvent(createPointerEvent('pointerdown', { x: 50, y: 50 }));
    minimalScroller.dispatchEvent(
      createPointerEvent('pointermove', { x: 50, y: 70, timeStamp: 16 }),
    );
    minimalScroller.dispatchEvent(
      createPointerEvent('pointermove', { x: 50, y: 250, timeStamp: 32 }),
    );
    minimalScroller.dispatchEvent(
      createPointerEvent('pointerup', { x: 50, y: 250, timeStamp: 48 }),
    );
    minimalFixture.detectChanges();

    expect(minimalFixture.componentInstance.refreshCount).toBe(1);
    // With nothing reporting on the refresh there is nothing to wait for beyond
    // the minimum hold, after which the surface comes back on its own.
    expect(minimalScroller.className).toContain('tls-pull-to-refresh--refreshing');
    vi.advanceTimersByTime(PULL_TO_REFRESH_DEFAULT_MIN_REFRESHING_TIME);
    minimalFixture.detectChanges();
    expect(minimalScroller.style.getPropertyValue('--tls-pull-distance')).toBe('0px');
    expect(minimalScroller.className).toContain('tls-pull-to-refresh--idle');
    vi.useRealTimers();
  });

  it('reads no pull at all while disabled', () => {
    setScrollMetrics(0);
    host.enabled.set(false);
    fixture.detectChanges();

    pull(200);
    release(200);
    fixture.detectChanges();

    expect(host.refreshCount).toBe(0);
    expect(distanceStyle()).toBe('');
  });
});
