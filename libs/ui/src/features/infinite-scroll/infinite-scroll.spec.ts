import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InfiniteScroll } from './infinite-scroll';
import { DEFAULT_INFINITE_SCROLL_CONFIG } from './infinite-scroll.config';

/**
 * jsdom implements no `IntersectionObserver`, so the sentinel's visibility is driven by
 * hand: every observer the component creates is recorded, and the newest one stands for
 * the watch currently in place.
 *
 * Visibility belongs to the sentinel rather than to any one observer, so it is held here
 * and reported by each new observer as it starts — the behaviour the component's re-arming
 * turns on, and the one an observer that only records its target would hide.
 */
class FakeIntersectionObserver {
  public static instances: FakeIntersectionObserver[] = [];

  /** Where the sentinel sits, as every observer of it would report. */
  public static sentinelVisible = false;

  public readonly observed: Element[] = [];
  public disconnected = false;

  constructor(
    private readonly _callback: IntersectionObserverCallback,
    public readonly options: IntersectionObserverInit | undefined,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  public static get latest(): FakeIntersectionObserver {
    const latest = FakeIntersectionObserver.instances.at(-1);
    if (!latest) throw new Error('No IntersectionObserver was created.');

    return latest;
  }

  /** Observers created and not yet disconnected — the watch that is actually in place. */
  public static get active(): FakeIntersectionObserver[] {
    return FakeIntersectionObserver.instances.filter(instance => !instance.disconnected);
  }

  public observe(element: Element): void {
    this.observed.push(element);

    // A real observer delivers its first record in a later task, never inside `observe`.
    queueMicrotask(() => {
      if (this.disconnected) return;
      this.emit(FakeIntersectionObserver.sentinelVisible);
    });
  }

  public disconnect(): void {
    this.disconnected = true;
  }

  public emit(isIntersecting: boolean): void {
    FakeIntersectionObserver.sentinelVisible = isIntersecting;
    this._callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

@Component({
  imports: [InfiniteScroll],
  template: `
    <tls-infinite-scroll
      [loading]="loading()"
      [complete]="complete()"
      [disabled]="disabled()"
      [manual]="manual()"
      [autoLoadLimit]="autoLoadLimit()"
      (loadMore)="loads.set(loads() + 1)"
    />
  `,
})
class TestHost {
  public readonly infiniteScroll = viewChild.required(InfiniteScroll);
  public readonly loading = signal(false);
  public readonly complete = signal(false);
  public readonly disabled = signal(false);
  public readonly manual = signal(false);
  public readonly autoLoadLimit = signal(DEFAULT_INFINITE_SCROLL_CONFIG.autoLoadLimit);
  public readonly loads = signal(0);
}

describe('InfiniteScroll', () => {
  const LIMIT = DEFAULT_INFINITE_SCROLL_CONFIG.autoLoadLimit;

  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  const text = (selector: string): string | null => {
    const element = fixture.debugElement.query(By.css(selector));

    return element ? element.nativeElement.textContent.trim() : null;
  };

  /** One page as a consumer reports it: taken on, then landed. */
  const settlePage = async (): Promise<void> => {
    host.loading.set(true);
    await fixture.whenStable();

    host.loading.set(false);
    await fixture.whenStable();
  };

  /** Loads pages until the automatic allowance is spent and the button takes over. */
  const spendAllowance = async (): Promise<void> => {
    FakeIntersectionObserver.latest.emit(true);
    await fixture.whenStable();

    while (host.loads() < LIMIT) await settlePage();
  };

  beforeEach(async () => {
    FakeIntersectionObserver.instances = [];
    FakeIntersectionObserver.sentinelVisible = false;
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('watches its own host element with the configured margin', () => {
    const observer = FakeIntersectionObserver.latest;
    const element = fixture.debugElement.query(By.directive(InfiniteScroll)).nativeElement;

    expect(observer.observed).toEqual([element]);
    expect(observer.options).toMatchObject({
      root: null,
      rootMargin: `${DEFAULT_INFINITE_SCROLL_CONFIG.rootMargin}px`,
    });
  });

  it('asks for the next page when the sentinel comes into view', () => {
    FakeIntersectionObserver.latest.emit(true);

    expect(host.loads()).toBe(1);
  });

  it('ignores the sentinel leaving view', () => {
    FakeIntersectionObserver.latest.emit(false);

    expect(host.loads()).toBe(0);
  });

  it('lets one request stand until something reports on it', async () => {
    FakeIntersectionObserver.latest.emit(true);
    await fixture.whenStable();

    // The sentinel keeps reporting itself in view until the collection grows past it, and
    // none of that is news: the page already asked for is still on its way.
    FakeIntersectionObserver.latest.emit(true);
    await fixture.whenStable();

    expect(host.loads()).toBe(1);
  });

  it('asks again once the sentinel leaves and re-enters view', async () => {
    FakeIntersectionObserver.latest.emit(true);
    await fixture.whenStable();

    FakeIntersectionObserver.latest.emit(false);
    FakeIntersectionObserver.latest.emit(true);
    await fixture.whenStable();

    expect(host.loads()).toBe(2);
  });

  it('suspends the watch while a page is in flight and continues a collection too short', async () => {
    FakeIntersectionObserver.latest.emit(true);
    await fixture.whenStable();

    host.loading.set(true);
    await fixture.whenStable();

    expect(FakeIntersectionObserver.active).toHaveLength(0);
    expect(text('.announcement')).toBe(DEFAULT_INFINITE_SCROLL_CONFIG.labels.loading);

    host.loading.set(false);
    await fixture.whenStable();

    // The page landed without pushing the sentinel out of view, and the fresh observer says
    // so on its own — no second scroll is needed to keep the collection filling.
    expect(host.loads()).toBe(2);
  });

  it('hands over to the button after the automatic loads are spent', async () => {
    await spendAllowance();

    expect(host.loads()).toBe(LIMIT);
    expect(FakeIntersectionObserver.active).toHaveLength(0);
    expect(text('.state')).toBe(DEFAULT_INFINITE_SCROLL_CONFIG.labels.loadMore);
  });

  it('makes one press of the button one request', async () => {
    await spendAllowance();

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    await fixture.whenStable();

    // Renewing the allowance puts the sentinel back under observation, and the sentinel is
    // certainly in view — the button pressed a moment ago sits inside it. The request that
    // press already made has to survive that.
    expect(host.loads()).toBe(LIMIT + 1);
    expect(FakeIntersectionObserver.active).toHaveLength(1);
  });

  it('never watches the sentinel in manual mode', async () => {
    host.manual.set(true);
    await fixture.whenStable();

    expect(FakeIntersectionObserver.active).toHaveLength(0);
    expect(text('.state')).toBe(DEFAULT_INFINITE_SCROLL_CONFIG.labels.loadMore);
  });

  it('stops at an exhausted collection and announces the end it paged to', async () => {
    FakeIntersectionObserver.latest.emit(true);
    await settlePage();

    host.complete.set(true);
    await fixture.whenStable();

    expect(FakeIntersectionObserver.active).toHaveLength(0);
    expect(text('.announcement')).toBe(DEFAULT_INFINITE_SCROLL_CONFIG.labels.complete);
    expect(text('.notice')).toBe(DEFAULT_INFINITE_SCROLL_CONFIG.labels.complete);
  });

  it('ends silently when the first page already held everything', async () => {
    // No page was ever requested through this trigger, so its exhaustion resolves nothing a
    // reader could be wondering about — the collection visibly just ends.
    host.complete.set(true);
    await fixture.whenStable();

    expect(FakeIntersectionObserver.active).toHaveLength(0);
    expect(fixture.debugElement.query(By.css('.state'))).toBeNull();
    expect(text('.announcement')).toBe('');
  });

  it('starts the end notice over with a replaced collection', async () => {
    FakeIntersectionObserver.latest.emit(true);
    await settlePage();

    // The collection is replaced — a new query, a changed filter — and its short successor
    // is exhausted from the start: the notice earned on the old collection does not carry.
    host.infiniteScroll().reset();
    host.complete.set(true);
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('.state'))).toBeNull();
    expect(text('.announcement')).toBe('');
  });

  it('renders nothing and watches nothing while disabled', async () => {
    host.disabled.set(true);
    await fixture.whenStable();

    expect(FakeIntersectionObserver.active).toHaveLength(0);
    expect(fixture.debugElement.query(By.css('.state'))).toBeNull();
    expect(text('.announcement')).toBe('');
  });

  it('stays suspended while disabled, whatever the collection is doing', async () => {
    host.disabled.set(true);
    host.loading.set(true);
    await fixture.whenStable();

    const element = fixture.debugElement.query(By.directive(InfiniteScroll)).nativeElement;

    expect(element.classList).toContain('tls-infinite-scroll--disabled');
    expect(fixture.debugElement.query(By.css('.state'))).toBeNull();
  });

  it('ignores a programmatic load once the collection is exhausted', async () => {
    host.complete.set(true);
    await fixture.whenStable();

    host.infiniteScroll().load();

    expect(host.loads()).toBe(0);
  });

  it('renews the allowance and puts the sentinel back under observation', async () => {
    await spendAllowance();
    await settlePage();

    host.infiniteScroll().reset();
    await fixture.whenStable();

    // Nothing is outstanding and the sentinel is still in view, so the renewed watch asks
    // for a page of its own accord — `reset` emits nothing itself.
    expect(host.loads()).toBe(LIMIT + 1);
    expect(FakeIntersectionObserver.active).toHaveLength(1);
  });
});
