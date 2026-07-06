import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Odometer } from './odometer';

describe('Odometer', () => {
  let component: Odometer;
  let fixture: ComponentFixture<Odometer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Odometer],
    }).compileComponents();

    fixture = TestBed.createComponent(Odometer);
    component = fixture.componentInstance;
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function digitColumns(): Element[] {
    return Array.from(host().querySelectorAll('tls-odometer-digit'));
  }

  function symbols(): string[] {
    return Array.from(host().querySelectorAll('.tls-odometer__symbol')).map(element =>
      (element.textContent ?? '').trim(),
    );
  }

  it('should create', () => {
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should apply tls-odometer class', () => {
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('tls-odometer');
  });

  it('should render one digit column per integer digit', () => {
    fixture.componentRef.setInput('value', 2026);
    fixture.detectChanges();
    expect(digitColumns().length).toBe(4);
  });

  it('should left-pad to minIntegerDigits with leading zeros', () => {
    fixture.componentRef.setInput('value', 42);
    fixture.componentRef.setInput('minIntegerDigits', 5);
    fixture.detectChanges();
    expect(digitColumns().length).toBe(5);
    expect(component['formattedValue']()).toBe('00042');
  });

  it('should render a decimal separator and fraction digits', () => {
    fixture.componentRef.setInput('value', 12.5);
    fixture.componentRef.setInput('fractionDigits', 2);
    fixture.detectChanges();
    expect(component['formattedValue']()).toBe('12.50');
    expect(symbols()).toContain('.');
    expect(digitColumns().length).toBe(4);
  });

  it('should honour a custom decimal separator', () => {
    fixture.componentRef.setInput('value', 3.14);
    fixture.componentRef.setInput('fractionDigits', 2);
    fixture.componentRef.setInput('decimalSeparator', ',');
    fixture.detectChanges();
    expect(symbols()).toContain(',');
  });

  it('should prefix negative values with a minus sign', () => {
    fixture.componentRef.setInput('value', -7);
    fixture.detectChanges();
    expect(symbols()).toContain('−');
    expect(component['formattedValue']()).toBe('−7');
  });

  it('should expose the formatted value as the accessible name', () => {
    fixture.componentRef.setInput('value', 2026);
    fixture.detectChanges();
    const value = fixture.nativeElement.querySelector('.tls-odometer__value');
    expect(value.textContent.trim()).toBe('2026');
  });

  it('should let ariaLabel override the announced text', () => {
    fixture.componentRef.setInput('value', 2026);
    fixture.componentRef.setInput('ariaLabel', 'year');
    fixture.detectChanges();
    const value = fixture.nativeElement.querySelector('.tls-odometer__value');
    expect(value.textContent.trim()).toBe('year');
  });

  it('should hide the visual row from assistive technology', () => {
    fixture.componentRef.setInput('value', 1);
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('.tls-odometer__row');
    expect(row.getAttribute('aria-hidden')).toBe('true');
  });
});
