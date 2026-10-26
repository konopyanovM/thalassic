import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Breadcrumbs } from './breadcrumbs';
import { BreadcrumbItem } from './breadcrumbs.types';

describe('Breadcrumbs', () => {
  let component: Breadcrumbs;
  let fixture: ComponentFixture<Breadcrumbs>;

  const items: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Library', link: '/library' },
    { label: 'Data' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breadcrumbs],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Breadcrumbs);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a navigation landmark with an accessible name', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('navigation');
    expect(host.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('renders items with links as anchors and items without as text', () => {
    const host = fixture.nativeElement as HTMLElement;
    const anchors = host.querySelectorAll('a.tls-breadcrumbs__link');
    const texts = host.querySelectorAll('span.tls-breadcrumbs__text');
    expect(anchors.length).toBe(2);
    expect(texts.length).toBe(1);
    expect(texts[0].textContent).toContain('Data');
  });

  it('marks the last item as the current page', () => {
    const host = fixture.nativeElement as HTMLElement;
    const current = host.querySelectorAll('[aria-current="page"]');
    expect(current.length).toBe(1);
    expect(current[0].textContent).toContain('Data');
  });

  it('renders a separator between items but not after the last one', () => {
    const host = fixture.nativeElement as HTMLElement;
    const separators = host.querySelectorAll('.tls-breadcrumbs__separator');
    expect(separators.length).toBe(items.length - 1);
  });

  /** Whether each rendered crumb is marked to give way, in trail order. */
  const truncating = (): boolean[] =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-breadcrumbs__item'),
      item => item.classList.contains('tls-breadcrumbs__item--truncate'),
    );

  it('lets the trailing crumb give way while no crumb is marked', () => {
    expect(truncating()).toEqual([false, false, true]);
  });

  it('lets only the marked crumbs give way once one is marked', async () => {
    fixture.componentRef.setInput('items', [
      { label: 'Home', link: '/' },
      { label: 'A name of any length', link: '/library', truncate: true },
      { label: 'Data' },
    ]);
    await fixture.whenStable();

    expect(truncating()).toEqual([false, true, false]);
  });
});

@Component({
  imports: [Breadcrumbs],
  template: `
    <tls-breadcrumbs [items]="items">
      <ng-template let-item let-last="last">
        <span class="custom" [class.custom--last]="last">{{ item.label }}!</span>
      </ng-template>
    </tls-breadcrumbs>
  `,
})
class BreadcrumbsTemplateHost {
  readonly items: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Data' },
  ];
}

describe('Breadcrumbs custom item template', () => {
  let fixture: ComponentFixture<BreadcrumbsTemplateHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbsTemplateHost],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbsTemplateHost);
    await fixture.whenStable();
  });

  it('renders the projected template instead of the built-in label', () => {
    const host = fixture.nativeElement as HTMLElement;
    const custom = host.querySelectorAll('.custom');
    expect(custom.length).toBe(2);
    expect(custom[0].textContent).toContain('Home!');
    expect(host.querySelector('.tls-breadcrumbs__label')).toBeNull();
  });

  it('exposes the last-item flag through the template context', () => {
    const host = fixture.nativeElement as HTMLElement;
    const lastFlagged = host.querySelectorAll('.custom--last');
    expect(lastFlagged.length).toBe(1);
    expect(lastFlagged[0].textContent).toContain('Data!');
  });

  it('keeps the list structure, links, and current-page marker owned by the component', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('a.tls-breadcrumbs__link').length).toBe(1);
    expect(host.querySelectorAll('[aria-current="page"]').length).toBe(1);
    expect(host.querySelectorAll('.tls-breadcrumbs__separator').length).toBe(1);
  });
});
