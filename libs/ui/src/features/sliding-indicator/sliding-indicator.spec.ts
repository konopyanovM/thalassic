import { Component, ElementRef, signal, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { orientation } from '../../types';
import { slidingIndicator } from './sliding-indicator';
import { SLIDING_INDICATOR_CONFIG } from './sliding-indicator.token';

/** A strip of three items, one of them chosen, with an indicator kept on it. */
@Component({
  template: `
    <div #strip>
      @for (item of items; track item) {
        <button #item type="button">{{ item }}</button>
      }
    </div>
  `,
})
class Strip {
  protected readonly items = ['Day', 'Week', 'Month'];

  public readonly chosen = signal<number | null>(1);
  public readonly orientation = signal<orientation>('horizontal');

  private readonly _strip = viewChild.required<ElementRef<HTMLElement>>('strip');
  private readonly _items = viewChildren<ElementRef<HTMLElement>>('item');

  constructor() {
    slidingIndicator({
      container: () => this._strip().nativeElement,
      target: () => {
        const chosen = this.chosen();
        const item = chosen === null ? undefined : this._items()[chosen];
        return item ? item.nativeElement : null;
      },
      orientation: this.orientation,
    });
  }
}

describe('slidingIndicator', () => {
  let fixture: ComponentFixture<Strip>;

  /** The size reports the indicator asked for, to deliver as a browser would. */
  let reportResize: (() => void)[];

  const strip = (): HTMLElement => fixture.nativeElement.querySelector('div');
  const item = (index: number): HTMLElement => fixture.nativeElement.querySelectorAll('button')[index];

  /** Lays an item out where a browser would, which jsdom never does. */
  const layOut = (
    element: HTMLElement,
    box: { left: number; top: number; width: number; height: number },
  ): void => {
    Object.defineProperties(element, {
      offsetLeft: { configurable: true, value: box.left },
      offsetTop: { configurable: true, value: box.top },
      offsetWidth: { configurable: true, value: box.width },
      offsetHeight: { configurable: true, value: box.height },
    });
  };

  const state = (): string | null => strip().getAttribute('data-sliding-indicator');
  const box = (): string[] =>
    ['x', 'y', 'width', 'height'].map(side =>
      strip().style.getPropertyValue(`--tls-sliding-indicator-${side}`),
    );

  async function create(config?: Record<orientation, boolean>): Promise<void> {
    TestBed.configureTestingModule({
      imports: [Strip],
      providers: config ? [{ provide: SLIDING_INDICATOR_CONFIG, useValue: config }] : [],
    });
    fixture = TestBed.createComponent(Strip);
    await fixture.whenStable();
    layOut(item(0), { left: 3, top: 3, width: 50, height: 28 });
    layOut(item(1), { left: 56, top: 3, width: 60, height: 28 });
    layOut(item(2), { left: 119, top: 3, width: 70, height: 28 });
    reportResize.forEach(report => report());
    await fixture.whenStable();
  }

  beforeEach(() => {
    reportResize = [];
    // jsdom has no ResizeObserver; each one made here is kept so a test can
    // report a size change through it.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        public readonly observe = vi.fn();
        public readonly disconnect = vi.fn();

        constructor(callback: () => void) {
          reportResize.push(callback);
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('places the indicator on the chosen item, at the box that item takes', async () => {
    await create();

    expect(state()).toBe('placed');
    expect(box()).toEqual(['56px', '3px', '60px', '28px']);
  });

  it('sends the indicator travelling to an item newly chosen', async () => {
    await create();

    fixture.componentInstance.chosen.set(2);
    await fixture.whenStable();

    expect(state()).toBe('travelling');
    expect(box()).toEqual(['119px', '3px', '70px', '28px']);
  });

  it('moves the indicator at once when its item is laid out anew', async () => {
    await create();
    fixture.componentInstance.chosen.set(2);
    await fixture.whenStable();

    layOut(item(2), { left: 140, top: 3, width: 90, height: 28 });
    reportResize.forEach(report => report());
    await fixture.whenStable();

    expect(state()).toBe('placed');
    expect(box()).toEqual(['140px', '3px', '90px', '28px']);
  });

  it('leaves an indicator on its way alone when a size report changes nothing', async () => {
    await create();
    fixture.componentInstance.chosen.set(2);
    await fixture.whenStable();

    reportResize.forEach(report => report());
    await fixture.whenStable();

    expect(state()).toBe('travelling');
  });

  it('withdraws the indicator when nothing is chosen, and places it without travel when something is again', async () => {
    await create();

    fixture.componentInstance.chosen.set(null);
    await fixture.whenStable();
    expect(state()).toBeNull();
    expect(box()).toEqual(['', '', '', '']);

    fixture.componentInstance.chosen.set(0);
    await fixture.whenStable();
    expect(state()).toBe('placed');
    expect(box()).toEqual(['3px', '3px', '50px', '28px']);
  });

  it('leaves a column alone unless the configuration turns it on', async () => {
    await create();

    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();

    expect(state()).toBeNull();
    expect(box()).toEqual(['', '', '', '']);
  });

  it('keeps an indicator on a column the configuration turns on', async () => {
    await create({ horizontal: true, vertical: true });
    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();

    fixture.componentInstance.chosen.set(2);
    await fixture.whenStable();

    expect(state()).toBe('travelling');
  });

  it('leaves a row alone where the configuration turns it off', async () => {
    await create({ horizontal: false, vertical: false });

    expect(state()).toBeNull();
  });

  it('places the indicator in a document that offers no size observer', async () => {
    vi.unstubAllGlobals();
    TestBed.configureTestingModule({ imports: [Strip] });
    fixture = TestBed.createComponent(Strip);
    await fixture.whenStable();

    expect(state()).toBe('placed');
  });
});
