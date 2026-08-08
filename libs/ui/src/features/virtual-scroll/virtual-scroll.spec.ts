import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
