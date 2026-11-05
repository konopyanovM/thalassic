import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputNumber } from './input-number';

describe('InputNumber', () => {
  let component: InputNumber;
  let fixture: ComponentFixture<InputNumber>;
  let inputElement: HTMLInputElement;

  /** Builds the field as it renders under `locale`. */
  const createField = async (locale = 'en-US'): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [InputNumber],
      providers: [{ provide: LOCALE_ID, useValue: locale }],
    }).compileComponents();

    fixture = TestBed.createComponent(InputNumber);
    component = fixture.componentInstance;
    await fixture.whenStable();
    inputElement = fixture.nativeElement.querySelector('input');
  };

  /** Types `text` as the field's whole content, as the browser reports it. */
  const type = async (text: string): Promise<void> => {
    inputElement.value = text;
    inputElement.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  /** Whether the field lets `data` be inserted with the caret at the end. */
  const accepts = (data: string): boolean => {
    inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
    const event = new InputEvent('beforeinput', { inputType: 'insertText', data, cancelable: true });
    inputElement.dispatchEvent(event);
    return !event.defaultPrevented;
  };

  const setInputs = async (inputs: Record<string, unknown>): Promise<void> => {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    await fixture.whenStable();
  };

  it('carries the outlined variant class by default', async () => {
    await createField();

    expect(inputElement.classList).toContain('tls-form-control--outlined');
  });

  it('switches to the plain variant class', async () => {
    await createField();
    await setInputs({ variant: 'plain' });

    expect(inputElement.classList).toContain('tls-form-control--plain');
    expect(inputElement.classList).not.toContain('tls-form-control--outlined');
  });

  describe('keyboard', () => {
    beforeEach(() => createField());

    it('asks for a numeric keypad for whole numbers from zero', async () => {
      await setInputs({ min: 0 });

      expect(inputElement.getAttribute('inputmode')).toBe('numeric');
    });

    it('asks for a decimal keypad for a fractional step', async () => {
      await setInputs({ min: 0, step: 0.5 });

      expect(inputElement.getAttribute('inputmode')).toBe('decimal');
    });

    it('asks for the full keyboard for a minimum below zero', async () => {
      await setInputs({ min: -10 });

      expect(inputElement.getAttribute('inputmode')).toBe('text');
    });

    it('keeps a number keypad for a field with no minimum', () => {
      expect(inputElement.getAttribute('inputmode')).toBe('numeric');
    });

    it('takes an explicit keyboard over the derived one', async () => {
      await setInputs({ inputMode: 'decimal' });

      expect(inputElement.getAttribute('inputmode')).toBe('decimal');
    });

  });

  describe('typing', () => {
    beforeEach(async () => {
      await createField();
      await setInputs({ min: 0, step: 0.5 });
    });

    it('reads a comma as the decimal point', async () => {
      await type('62,5');

      expect(component.value()).toBe(62.5);
    });

    it('keeps a number still being typed as typed', async () => {
      await type('62,');

      expect(component.value()).toBe(62);
      expect(inputElement.value).toBe('62,');
    });

    it('refuses what no number can become', async () => {
      await type('62');

      expect(accepts('a')).toBe(false);
      expect(accepts('-')).toBe(false);
      expect(accepts('.')).toBe(true);
    });

    it('refuses a fraction where the step is whole', async () => {
      await setInputs({ step: 1 });

      expect(accepts('.')).toBe(false);
    });

    it('puts back text that is no number', async () => {
      await type('62');
      await type('6x2');

      expect(inputElement.value).toBe('62');
      expect(component.value()).toBe(62);
    });

    it('clamps and tidies the text once committed', async () => {
      await setInputs({ max: 100 });
      await type('150,');
      inputElement.dispatchEvent(new Event('change'));
      await fixture.whenStable();

      expect(component.value()).toBe(100);
      expect(inputElement.value).toBe('100');
    });

    it('empties the value along with the text', async () => {
      await type('62');
      await type('');

      expect(component.value()).toBeNull();
    });
  });

  it("shows the value in the page's locale", async () => {
    await createField('ru');
    await setInputs({ value: 62.5 });

    expect(inputElement.value).toBe('62,5');
  });

  it('writes Latin digits in a locale with digits of its own, so the figure stays editable', async () => {
    await createField('ar-EG');
    await setInputs({ value: 62.5, step: 0.5 });

    expect(inputElement.value).toBe('62.5');
    expect(accepts('5')).toBe(true);
  });

  describe('arrow keys', () => {
    const press = async (key: string): Promise<void> => {
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
      await fixture.whenStable();
    };

    beforeEach(() => createField());

    it('step the value without collecting float error', async () => {
      await setInputs({ value: 0.1, step: 0.1 });

      await press('ArrowUp');
      await press('ArrowUp');

      expect(component.value()).toBe(0.3);
      expect(inputElement.value).toBe('0.3');
    });

    it('stop at the bounds', async () => {
      await setInputs({ value: 1, min: 0, step: 1 });

      await press('ArrowDown');
      await press('ArrowDown');

      expect(component.value()).toBe(0);
    });

    it('start an empty field from the minimum', async () => {
      await setInputs({ min: 5 });

      await press('ArrowUp');

      expect(component.value()).toBe(5);
    });
  });
});
