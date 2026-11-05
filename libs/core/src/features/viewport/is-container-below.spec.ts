import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { isContainerBelow } from './is-container-below';
import { DEFAULT_VIEWPORT_CONFIG } from './viewport.config';

/**
 * jsdom implements no `ResizeObserver`, so sizes are delivered by hand: every observer
 * created is recorded, and the newest stands for the watch in place.
 */
class FakeResizeObserver {
  public static instances: FakeResizeObserver[] = [];

  public readonly observed: Element[] = [];
  public disconnected = false;

  constructor(private readonly _callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  public static get latest(): FakeResizeObserver {
    const latest = FakeResizeObserver.instances[FakeResizeObserver.instances.length - 1];
    if (!latest) throw new Error('No ResizeObserver was created.');

    return latest;
  }

  public observe(element: Element): void {
    this.observed.push(element);
  }

  public disconnect(): void {
    this.disconnected = true;
  }

  /** Reports the observed element's content box at `inlineSize` pixels wide. */
  public resize(inlineSize: number): void {
    const entry = {
      contentBoxSize: [{ inlineSize, blockSize: 0 }],
    } as unknown as ResizeObserverEntry;
    this._callback([entry], this as unknown as ResizeObserver);
  }
}

@Component({ template: '' })
class TestHost {
  public readonly isCompact = isContainerBelow('md');
}

describe('isContainerBelow', () => {
  const MD = DEFAULT_VIEWPORT_CONFIG.breakpoints.md;

  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('watches the host and decides nothing before its first measurement', () => {
    const fixture = TestBed.createComponent(TestHost);

    expect(FakeResizeObserver.latest.observed).toEqual([fixture.nativeElement]);
    expect(fixture.componentInstance.isCompact()).toBeUndefined();
  });

  it('flips at the breakpoint, inclusive as the container query is', () => {
    const fixture = TestBed.createComponent(TestHost);
    const observer = FakeResizeObserver.latest;

    observer.resize(MD + 1);
    expect(fixture.componentInstance.isCompact()).toBe(false);

    observer.resize(MD);
    expect(fixture.componentInstance.isCompact()).toBe(true);
  });

  it('stops watching once the host is destroyed', () => {
    const fixture = TestBed.createComponent(TestHost);

    fixture.destroy();

    expect(FakeResizeObserver.latest.disconnected).toBe(true);
  });

  it('measures nothing on the server', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const fixture = TestBed.createComponent(TestHost);

    expect(FakeResizeObserver.instances).toHaveLength(0);
    expect(fixture.componentInstance.isCompact()).toBeUndefined();
  });
});
