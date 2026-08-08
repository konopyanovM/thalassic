import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VirtualScroll } from './virtual-scroll';

interface Row {
  id: number;
  name: string;
}

const ROWS: Row[] = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  name: `Row ${index}`,
}));

@Component({
  imports: [VirtualScroll],
  template: `
    <tls-virtual-scroll
      [items]="rows()"
      [itemSize]="20"
      [focusable]="focusable()"
      [viewportId]="'rows-listbox'"
      [ariaMultiselectable]="multiselectable()"
      trackBy="id"
      viewportRole="list"
      ariaLabel="Rows"
      (scrolledIndexChange)="scrolledIndex.set($event)"
    >
      <ng-template #item let-row let-index="index" let-count="count">
        <div role="listitem" [attr.aria-posinset]="index + 1" [attr.aria-setsize]="count">
          {{ row.name }}
        </div>
      </ng-template>
    </tls-virtual-scroll>
  `,
})
class TestHost {
  public readonly virtualScroll = viewChild.required(VirtualScroll<Row>);
  public readonly rows = signal<Row[]>(ROWS);
  public readonly focusable = signal(true);
  public readonly multiselectable = signal<boolean | undefined>(undefined);
  public readonly scrolledIndex = signal(-1);
}

describe('VirtualScroll', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(host.virtualScroll()).toBeTruthy();
  });

  it('sizes the spacer to the whole collection while rendering only a window of it', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const spacer = element.querySelector<HTMLElement>('.cdk-virtual-scroll-spacer');

    expect(spacer).toBeTruthy();
    // 500 items of 20px. The spacer is what gives the scrollbar the size of the
    // whole collection even though only a window of it exists in the DOM.
    expect(spacer?.style.height).toBe('10000px');
    expect(element.querySelectorAll('[role="listitem"]').length).toBeLessThan(ROWS.length);
  });

  it('forwards role and accessible name to the scroll container, not the host', () => {
    const element: HTMLElement = fixture.nativeElement;
    const viewport = element.querySelector('.tls-virtual-scroll__viewport');
    const componentHost = element.querySelector('tls-virtual-scroll');

    expect(viewport?.getAttribute('role')).toBe('list');
    expect(viewport?.getAttribute('aria-label')).toBe('Rows');
    expect(componentHost?.hasAttribute('role')).toBe(false);
  });

  it('forwards the id to the scroll container so collection references resolve to it', () => {
    const element: HTMLElement = fixture.nativeElement;
    const viewport = element.querySelector('.tls-virtual-scroll__viewport');
    const componentHost = element.querySelector('tls-virtual-scroll');

    expect(viewport?.getAttribute('id')).toBe('rows-listbox');
    expect(componentHost?.hasAttribute('id')).toBe(false);
  });

  it('reflects aria-multiselectable on the scroll container only when set', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const viewport = element.querySelector('.tls-virtual-scroll__viewport');
    expect(viewport?.hasAttribute('aria-multiselectable')).toBe(false);

    host.multiselectable.set(true);
    await fixture.whenStable();
    expect(viewport?.getAttribute('aria-multiselectable')).toBe('true');
  });

  describe('scrollIndexIntoView', () => {
    let viewport: CdkVirtualScrollViewport;

    // The viewport cannot measure itself in a unit test, so the geometry is stubbed:
    // a 100px viewport over 20px items shows five of them.
    const stubGeometry = (scrollOffset: number) => {
      vi.spyOn(viewport, 'getViewportSize').mockReturnValue(100);
      vi.spyOn(viewport, 'measureScrollOffset').mockReturnValue(scrollOffset);
      return vi.spyOn(viewport, 'scrollTo').mockImplementation(() => undefined);
    };

    beforeEach(() => {
      viewport = fixture.debugElement
        .query(By.directive(CdkVirtualScrollViewport))
        .injector.get(CdkVirtualScrollViewport);
    });

    it('scrolls an item beyond the trailing edge onto that edge', () => {
      const scrollTo = stubGeometry(0);
      host.virtualScroll().scrollIndexIntoView(9);
      // Item 9 spans 180–200px; the minimal scroll puts its end on the viewport's end.
      expect(scrollTo).toHaveBeenCalledWith({ top: 100 });
    });

    it('scrolls an item before the leading edge onto that edge', () => {
      const scrollTo = stubGeometry(200);
      host.virtualScroll().scrollIndexIntoView(3);
      expect(scrollTo).toHaveBeenCalledWith({ top: 60 });
    });

    it('does not move for an item already fully visible', () => {
      const scrollTo = stubGeometry(0);
      host.virtualScroll().scrollIndexIntoView(2);
      expect(scrollTo).not.toHaveBeenCalled();
    });
  });

  it('makes the scroll container a tab stop so it can be scrolled from the keyboard', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const viewport = element.querySelector('.tls-virtual-scroll__viewport');
    expect(viewport?.getAttribute('tabindex')).toBe('0');

    host.focusable.set(false);
    await fixture.whenStable();
    expect(viewport?.hasAttribute('tabindex')).toBe(false);
  });

  it('reports the true position and collection size on every rendered item', () => {
    const element: HTMLElement = fixture.nativeElement;
    const first = element.querySelector('[role="listitem"]');

    expect(first?.getAttribute('aria-setsize')).toBe(String(ROWS.length));
    expect(first?.getAttribute('aria-posinset')).toBe('1');
  });

  it('resizes the spacer when the collection changes', async () => {
    host.rows.set(ROWS.slice(0, 10));
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    const spacer = element.querySelector<HTMLElement>('.cdk-virtual-scroll-spacer');
    expect(spacer?.style.height).toBe('200px');
  });
});
