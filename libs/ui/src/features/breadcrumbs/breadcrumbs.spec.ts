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
});
