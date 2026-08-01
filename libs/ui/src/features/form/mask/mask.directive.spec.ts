import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Input } from '../input/input';
import { InputDirective } from '../input/input.directive';
import { applyMask } from './apply-mask';
import { MaskDirective } from './mask.directive';

describe('applyMask', () => {
  it('formats a phone pattern and strips separators from the unmasked value', () => {
    const result = applyMask('(000) 000-0000', '1234567890', 10);

    expect(result.maskedValue).toBe('(123) 456-7890');
    expect(result.unmaskedValue).toBe('1234567890');
  });

  it('auto-inserts a separator once the following value character arrives', () => {
    expect(applyMask('00/00/0000', '31', 2).maskedValue).toBe('31');
    expect(applyMask('00/00/0000', '3112', 4).maskedValue).toBe('31/12');
  });

  it('absorbs a separator the user types explicitly', () => {
    expect(applyMask('00/00/0000', '31/12', 5).maskedValue).toBe('31/12');
  });

  it('skips characters that do not satisfy the current token', () => {
    expect(applyMask('AAA-000', 'abc123', 6).maskedValue).toBe('abc-123');
  });

  it('does not leave a dangling separator when the typed character is rejected', () => {
    const result = applyMask('00/00', '12a', 3);

    expect(result.maskedValue).toBe('12');
    expect(result.caret).toBe(2);
  });

  it('ignores input beyond the pattern length', () => {
    expect(applyMask('000', '12345', 5).maskedValue).toBe('123');
  });

  it('places the caret after the last consumed value character', () => {
    expect(applyMask('(000) 000-0000', '123', 3).caret).toBe(4);
  });
});

@Component({
  imports: [Input, InputDirective, MaskDirective],
  template: `
    <tls-input tlsMask="(000) 000-0000" #componentMask="tlsMask" />
    <input tlsInput [tlsMask]="datePattern()" #nativeMask="tlsMask" />
  `,
})
class HostComponent {
  readonly componentMask = viewChild.required<MaskDirective>('componentMask');
  readonly nativeMask = viewChild.required<MaskDirective>('nativeMask');
  readonly datePattern = signal('00/00/0000');
}

describe('MaskDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  function typeInto(element: HTMLInputElement, text: string): void {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }

  it('masks the inner input of tls-input and exposes the unmasked value', () => {
    const element = fixture.nativeElement.querySelector('tls-input input') as HTMLInputElement;

    typeInto(element, '1234567890');

    expect(element.value).toBe('(123) 456-7890');
    expect(host.componentMask().unmasked()).toBe('1234567890');
  });

  it('masks a bare native input and exposes the unmasked value', () => {
    const element = fixture.nativeElement.querySelector('input[tlsInput]') as HTMLInputElement;

    typeInto(element, '31122024');

    expect(element.value).toBe('31/12/2024');
    expect(host.nativeMask().unmasked()).toBe('31122024');
  });

  it('masks a value assigned programmatically without an input event', () => {
    const element = fixture.nativeElement.querySelector('input[tlsInput]') as HTMLInputElement;

    element.value = '31122024';

    expect(element.value).toBe('31/12/2024');
    expect(host.nativeMask().unmasked()).toBe('31122024');
  });

  it('reformats the current value when the pattern changes', async () => {
    const element = fixture.nativeElement.querySelector('input[tlsInput]') as HTMLInputElement;

    typeInto(element, '31122024');
    expect(element.value).toBe('31/12/2024');

    host.datePattern.set('00-00-0000');
    await fixture.whenStable();

    expect(element.value).toBe('31-12-2024');
    expect(host.nativeMask().unmasked()).toBe('31122024');
  });
});
