import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { hexCase } from '../color-picker/color-picker.types';
import { ColorInput } from './color-input';

@Component({
  imports: [ColorInput],
  template: `<tls-color-input
    [value]="value()"
    (valueChange)="value.set($event)"
    [alpha]="alpha()"
    [disabled]="disabled()"
    [pickerOnly]="pickerOnly()"
    [hexCase]="hexCase()"
    placeholder="Pick a color"
  />`,
})
class HostComponent {
  value = signal('#3b82f6');
  alpha = signal(false);
  disabled = signal(false);
  pickerOnly = signal(false);
  hexCase = signal<hexCase>('lower');
}

describe('ColorInput', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const query = <T extends HTMLElement>(selector: string): T => {
    const element = fixture.nativeElement.querySelector(selector);
    if (!element) throw new Error(`${selector} not rendered`);
    return element;
  };

  const trigger = (): HTMLButtonElement => query('.tls-color-input__trigger');
  const field = (): HTMLInputElement => query('.tls-color-input__input');

  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const overlayPicker = (): HTMLElement | null => document.querySelector('tls-color-picker');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(element => element.remove());
  });

  it('renders a swatch trigger and a text field showing the value', () => {
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(field().value).toBe('#3b82f6');
    expect(field().classList).toContain('tls-form-control');
  });

  it('commits a typed color on Enter, normalized to hex', async () => {
    field().value = 'rgb(255, 0, 0)';
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await settle();

    expect(host.value()).toBe('#ff0000');
    expect(field().value).toBe('#ff0000');
  });

  it('reverts an invalid entry on blur', async () => {
    field().value = 'not a color';
    field().dispatchEvent(new Event('blur'));
    await settle();

    expect(host.value()).toBe('#3b82f6');
    expect(field().value).toBe('#3b82f6');
  });

  it('opens the picker popover from the swatch trigger', async () => {
    expect(overlayPicker()).toBeNull();

    trigger().click();
    await settle();

    expect(overlayPicker()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('reflects a pick from the panel into the value and field', async () => {
    trigger().click();
    await settle();

    const hueRange = document.querySelector<HTMLInputElement>(
      '.tls-color-range--hue .tls-color-range-input',
    );
    if (!hueRange) throw new Error('picker hue slider not rendered');
    hueRange.value = '120';
    hueRange.dispatchEvent(new Event('input'));
    await settle();

    // Rotating the hue keeps the color's saturation and brightness.
    expect(host.value()).toBe('#3bf63b');
    expect(field().value).toBe('#3bf63b');
  });

  it('shows the placeholder when the value is empty', async () => {
    host.value.set('');
    await settle();

    expect(field().value).toBe('');
    expect(field().getAttribute('placeholder')).toBe('Pick a color');
  });

  it('shows the field in uppercase when hexCase is upper, committing lowercase', async () => {
    host.hexCase.set('upper');
    await settle();

    expect(field().value).toBe('#3B82F6');

    field().value = '#ff8800';
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await settle();

    expect(host.value()).toBe('#ff8800');
    expect(field().value).toBe('#FF8800');
  });

  it('keeps the field freely typable by default', () => {
    expect(field().readOnly).toBe(false);
    expect(field().getAttribute('aria-haspopup')).toBeNull();
  });

  it('makes the field readonly with popup semantics when pickerOnly', async () => {
    host.pickerOnly.set(true);
    await settle();

    expect(field().readOnly).toBe(true);
    expect(field().getAttribute('aria-haspopup')).toBe('dialog');
    expect(field().getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the panel from a click on the pickerOnly field', async () => {
    host.pickerOnly.set(true);
    await settle();

    field().click();
    await settle();

    expect(overlayPicker()).not.toBeNull();
    expect(field().getAttribute('aria-expanded')).toBe('true');
  });

  it('opens the panel instead of committing on Enter when pickerOnly', async () => {
    host.pickerOnly.set(true);
    await settle();

    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await settle();

    expect(overlayPicker()).not.toBeNull();
    expect(host.value()).toBe('#3b82f6');
  });

  it('does not open the panel from the field while disabled', async () => {
    host.pickerOnly.set(true);
    host.disabled.set(true);
    await settle();

    field().click();
    await settle();

    expect(overlayPicker()).toBeNull();
  });

  it('disables the trigger and field when disabled', async () => {
    host.disabled.set(true);
    await settle();

    expect(trigger().disabled).toBe(true);
    expect(field().disabled).toBe(true);
  });
});
