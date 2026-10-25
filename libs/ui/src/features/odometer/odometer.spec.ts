import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MotionService } from '@thalassic/core';
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

  it('should render nothing when given neither a value nor text', () => {
    fixture.detectChanges();
    expect(digitColumns().length).toBe(0);
    expect(component['formattedValue']()).toBe('');
  });

  it('should roll the digits of text and keep its other characters fixed', () => {
    fixture.componentRef.setInput('text', '2:59');
    fixture.detectChanges();
    expect(digitColumns().length).toBe(3);
    expect(symbols()).toEqual([':']);
    expect(component['formattedValue']()).toBe('2:59');
  });

  it('should prefer text over value', () => {
    fixture.componentRef.setInput('value', 7);
    fixture.componentRef.setInput('text', '1:00');
    fixture.detectChanges();
    expect(component['formattedValue']()).toBe('1:00');
  });

  it('should keep text columns keyed from the end as the text grows', () => {
    fixture.componentRef.setInput('text', '9:59');
    fixture.detectChanges();
    const unitsColumn = digitColumns()[2];

    fixture.componentRef.setInput('text', '10:00');
    fixture.detectChanges();
    expect(digitColumns()[3]).toBe(unitsColumn);
  });

  it('should swap a digit in place when animated is off', () => {
    fixture.componentRef.setInput('text', '5');
    fixture.componentRef.setInput('animated', false);
    fixture.detectChanges();

    fixture.componentRef.setInput('text', '6');
    fixture.detectChanges();
    const strip = host().querySelector('.tls-odometer-digit__strip') as HTMLElement;
    expect(strip.classList).not.toContain('tls-odometer-digit__strip--animate');
    expect(strip.style.getPropertyValue('--tls-odometer-offset')).toBe('16');
  });

  describe('spin', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    });

    afterEach(() => vi.useRealTimers());

    function strips(): HTMLElement[] {
      return Array.from(host().querySelectorAll<HTMLElement>('.tls-odometer-digit__strip'));
    }

    function offsets(): string[] {
      return strips().map(strip => strip.style.getPropertyValue('--tls-odometer-offset'));
    }

    /** Runs the two frames a roll waits before it starts, then renders the result. */
    function startRolls(): void {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
      fixture.detectChanges();
    }

    it('should lengthen each roll by stagger per digit column, skipping symbols', () => {
      fixture.componentRef.setInput('text', '4:04');
      fixture.componentRef.setInput('duration', 600);
      fixture.componentRef.setInput('stagger', 100);
      fixture.detectChanges();
      const durations = digitColumns().map(column =>
        (column as HTMLElement).style.getPropertyValue('--tls-odometer-duration'),
      );
      expect(durations).toEqual(['600ms', '700ms', '800ms']);
    });

    it('should extend the strip by a repetition on either side per revolution', () => {
      fixture.componentRef.setInput('text', '4');
      fixture.componentRef.setInput('revolutions', 2);
      fixture.detectChanges();
      expect(strips()[0].children.length).toBe(70);
      expect(offsets()).toEqual(['34']);
    });

    it('should roll the long way down with whole turns when direction is down', () => {
      fixture.componentRef.setInput('text', '4');
      fixture.componentRef.setInput('revolutions', 1);
      fixture.componentRef.setInput('direction', 'down');
      fixture.detectChanges();

      fixture.componentRef.setInput('text', '6');
      fixture.detectChanges();
      startRolls();
      // Centre 20, from 4: down eight rows to 6, then one turn down.
      expect(offsets()).toEqual(['6']);
    });

    it('should roll the long way up when direction is up', () => {
      fixture.componentRef.setInput('text', '6');
      fixture.componentRef.setInput('direction', 'up');
      fixture.detectChanges();

      fixture.componentRef.setInput('text', '4');
      fixture.detectChanges();
      startRolls();
      // Centre 10, from 6: up eight rows, through 9 and 0, to 4.
      expect(offsets()).toEqual(['24']);
    });

    it('should paint the first value in place without rollIn', () => {
      fixture.componentRef.setInput('text', '40');
      fixture.componentRef.setInput('revolutions', 1);
      fixture.detectChanges();
      startRolls();
      expect(offsets()).toEqual(['24', '20']);
      expect(strips()[0].classList).not.toContain('tls-odometer-digit__strip--animate');
    });

    it('should roll every column in from zero with rollIn, turning even one that lands on zero', () => {
      fixture.componentRef.setInput('text', '40');
      fixture.componentRef.setInput('revolutions', 1);
      fixture.componentRef.setInput('rollIn', true);
      fixture.detectChanges();
      expect(offsets()).toEqual(['20', '20']);

      startRolls();
      expect(offsets()).toEqual(['34', '30']);
      expect(strips()[1].classList).toContain('tls-odometer-digit__strip--animate');
    });

    describe('below the full motion level', () => {
      beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [Odometer],
          providers: [
            { provide: MotionService, useValue: { currentMotionLevel: signal('essential') } },
          ],
        });
        fixture = TestBed.createComponent(Odometer);
        component = fixture.componentInstance;
      });

      it('should drop the extra turns and keep the direct roll', () => {
        fixture.componentRef.setInput('text', '4');
        fixture.componentRef.setInput('revolutions', 2);
        fixture.detectChanges();
        expect(strips()[0].children.length).toBe(30);

        fixture.componentRef.setInput('text', '6');
        fixture.detectChanges();
        startRolls();
        expect(offsets()).toEqual(['16']);
      });

      it('should paint the first value in place despite rollIn', () => {
        fixture.componentRef.setInput('text', '4');
        fixture.componentRef.setInput('rollIn', true);
        fixture.detectChanges();
        startRolls();
        expect(offsets()).toEqual(['14']);
        expect(strips()[0].classList).not.toContain('tls-odometer-digit__strip--animate');
      });
    });
  });
});
