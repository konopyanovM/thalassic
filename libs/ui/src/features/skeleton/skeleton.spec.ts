import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  let component: Skeleton;
  let fixture: ComponentFixture<Skeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(Skeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply tls-skeleton class', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('tls-skeleton');
  });

  it('should use size for width and height when width and height are not set', () => {
    fixture.componentRef.setInput('size', 48);
    fixture.detectChanges();
    const style = fixture.nativeElement.style;
    expect(style.getPropertyValue('--tls-skeleton-width')).toBe('48px');
    expect(style.getPropertyValue('--tls-skeleton-height')).toBe('48px');
  });

  it('should override width independently from size', () => {
    fixture.componentRef.setInput('size', 48);
    fixture.componentRef.setInput('width', 200);
    fixture.detectChanges();
    const style = fixture.nativeElement.style;
    expect(style.getPropertyValue('--tls-skeleton-width')).toBe('200px');
    expect(style.getPropertyValue('--tls-skeleton-height')).toBe('48px');
  });

  it('should set border-radius to 50% when rounded is true', () => {
    fixture.componentRef.setInput('rounded', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.style.getPropertyValue('--tls-skeleton-radius')).toBe('50%');
  });

  it('should resolve the radius token to its custom property when rounded is false', () => {
    fixture.componentRef.setInput('radius', 'lg');
    fixture.detectChanges();
    expect(fixture.nativeElement.style.getPropertyValue('--tls-skeleton-radius')).toBe('var(--radius-lg)');
  });

  it('should resolve a scale-step radius token', () => {
    fixture.componentRef.setInput('radius', '2xl');
    fixture.detectChanges();
    expect(fixture.nativeElement.style.getPropertyValue('--tls-skeleton-radius')).toBe('var(--radius-2xl)');
  });

  it('should resolve a numeric radius to pixels', () => {
    fixture.componentRef.setInput('radius', 12);
    fixture.detectChanges();
    expect(fixture.nativeElement.style.getPropertyValue('--tls-skeleton-radius')).toBe('12px');
  });

  it('should pass a raw CSS length radius through untouched', () => {
    fixture.componentRef.setInput('radius', '2rem');
    fixture.detectChanges();
    expect(fixture.nativeElement.style.getPropertyValue('--tls-skeleton-radius')).toBe('2rem');
  });

  it('should apply no-animate class when animate is false', () => {
    fixture.componentRef.setInput('animate', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('tls-skeleton--no-animate');
  });
});
