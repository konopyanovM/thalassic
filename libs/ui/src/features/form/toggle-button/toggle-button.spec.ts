import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleButton } from './toggle-button';

describe('ToggleButton', () => {
  let component: ToggleButton;
  let fixture: ComponentFixture<ToggleButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle checked on click', () => {
    fixture.nativeElement.click();
    expect(component.checked()).toBe(true);

    fixture.nativeElement.click();
    expect(component.checked()).toBe(false);
  });

  it('should not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    fixture.nativeElement.click();
    expect(component.checked()).toBe(false);
  });

  it('should apply checked color and variant classes only while pressed', async () => {
    fixture.componentRef.setInput('checkedColor', 'success');
    fixture.componentRef.setInput('checkedVariant', 'tonal');
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).not.toContain('tls-toggle-button--checked-success');

    component.checked.set(true);
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).toContain('tls-toggle-button--checked-success');
    expect(fixture.nativeElement.classList).toContain('tls-toggle-button--checked-tonal');
  });

  it('should keep both state labels rendered when staticWidth is set', async () => {
    fixture.componentRef.setInput('label', 'Mute');
    fixture.componentRef.setInput('checkedLabel', 'Muted');
    fixture.componentRef.setInput('staticWidth', true);
    await fixture.whenStable();

    const labels = fixture.nativeElement.querySelectorAll('.tls-toggle-button__label');
    expect(labels.length).toBe(2);
    expect(labels[0].classList).not.toContain('tls-toggle-button__label--hidden');
    expect(labels[1].classList).toContain('tls-toggle-button__label--hidden');

    component.checked.set(true);
    await fixture.whenStable();

    expect(labels[0].classList).toContain('tls-toggle-button__label--hidden');
    expect(labels[1].classList).not.toContain('tls-toggle-button__label--hidden');
  });

  it('should reflect the pressed state on aria-pressed', async () => {
    component.checked.set(true);
    await fixture.whenStable();

    expect(fixture.nativeElement.getAttribute('aria-pressed')).toBe('true');
  });

  it('should show the checked label while pressed and omit aria-pressed', async () => {
    fixture.componentRef.setInput('label', 'Mute');
    fixture.componentRef.setInput('checkedLabel', 'Muted');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent.trim()).toBe('Mute');
    expect(fixture.nativeElement.getAttribute('aria-pressed')).toBeNull();

    component.checked.set(true);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent.trim()).toBe('Muted');
    expect(fixture.nativeElement.getAttribute('aria-pressed')).toBeNull();
  });
});
