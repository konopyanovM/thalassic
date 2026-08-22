import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPicker } from './color-picker';
import { colorFormat, hexCase } from './color-picker.types';

@Component({
  imports: [ColorPicker],
  template: `<tls-color-picker
    [value]="value()"
    (valueChange)="value.set($event)"
    [alpha]="alpha()"
    [formats]="formats()"
    [presets]="presets()"
    [disabled]="disabled()"
    [hexCase]="hexCase()"
  />`,
})
class HostComponent {
  value = signal('#ff0000');
  alpha = signal(false);
  formats = signal<colorFormat[]>(['hex', 'rgb', 'hsl']);
  presets = signal<string[]>([]);
  disabled = signal(false);
  hexCase = signal<hexCase>('lower');
}

describe('ColorPicker', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const query = <T extends HTMLElement>(selector: string): T => {
    const element = fixture.nativeElement.querySelector(selector);
    if (!element) throw new Error(`${selector} not rendered`);
    return element;
  };

  const svThumb = (): HTMLElement => query('.tls-color-picker__area-thumb');
  const hueRange = (): HTMLInputElement => query('.tls-color-range--hue .tls-color-range-input');
  const alphaRange = (): HTMLInputElement =>
    query('.tls-color-range--alpha .tls-color-range-input');
  const readout = (): HTMLInputElement => query('.tls-color-picker__readout-input');

  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const setRange = async (range: HTMLInputElement, rangeValue: string): Promise<void> => {
    range.value = rangeValue;
    range.dispatchEvent(new Event('input'));
    await settle();
  };

  const typeReadout = async (text: string, key = 'Enter'): Promise<void> => {
    readout().value = text;
    if (key === 'Enter') {
      readout().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    } else {
      readout().dispatchEvent(new Event('blur'));
    }
    await settle();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  it('reflects the bound value in the hue slider and thumb description', () => {
    expect(hueRange().value).toBe('0');
    expect(svThumb().getAttribute('aria-valuetext')).toBe('Saturation 100%, brightness 100%');
  });

  it('emits a hex value when the hue slider moves', async () => {
    await setRange(hueRange(), '120');
    expect(host.value()).toBe('#00ff00');
  });

  it('adjusts saturation and brightness from the thumb keyboard', async () => {
    svThumb().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    await settle();
    expect(host.value()).toBe('#ff0303');

    svThumb().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await settle();
    expect(host.value()).toBe('#fc0303');
  });

  it('keeps the chosen hue while the color is black', async () => {
    host.value.set('#000000');
    await settle();

    await setRange(hueRange(), '120');
    expect(host.value()).toBe('#000000');

    svThumb().dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    await settle();
    expect(host.value()).toBe('#00ff00');
  });

  it('commits a typed readout value in any supported notation', async () => {
    await typeReadout('rgb(0, 0, 255)');
    expect(host.value()).toBe('#0000ff');
  });

  it('reverts an invalid readout entry on blur', async () => {
    await typeReadout('not a color', 'blur');
    expect(host.value()).toBe('#ff0000');
    expect(readout().value).toBe('#ff0000');
  });

  it('cycles the readout format', async () => {
    const formatButton = query<HTMLButtonElement>('.tls-color-picker__readout-format');
    expect(readout().value).toBe('#ff0000');

    formatButton.click();
    await settle();
    expect(readout().value).toBe('rgb(255, 0, 0)');

    formatButton.click();
    await settle();
    expect(readout().value).toBe('hsl(0, 100%, 50%)');

    formatButton.click();
    await settle();
    expect(readout().value).toBe('#ff0000');
  });

  it('hides the format toggle when only one format is allowed', async () => {
    host.formats.set(['hex']);
    await settle();

    expect(fixture.nativeElement.querySelector('.tls-color-picker__readout-format')).toBeNull();
    expect(readout().value).toBe('#ff0000');
  });

  it('starts on and cycles through only the allowed formats', async () => {
    host.formats.set(['rgb', 'hsl']);
    await settle();

    expect(readout().value).toBe('rgb(255, 0, 0)');

    const formatButton = query<HTMLButtonElement>('.tls-color-picker__readout-format');
    formatButton.click();
    await settle();
    expect(readout().value).toBe('hsl(0, 100%, 50%)');

    formatButton.click();
    await settle();
    expect(readout().value).toBe('rgb(255, 0, 0)');
  });

  it('renders presets, marks the selected one, and commits the clicked one', async () => {
    host.presets.set(['#ff0000', '#00ff00']);
    await settle();

    const presetOptions = fixture.nativeElement.querySelectorAll(
      '.tls-color-picker__presets [role="option"]',
    );
    expect(presetOptions.length).toBe(2);
    expect(presetOptions[0].getAttribute('aria-selected')).toBe('true');
    expect(presetOptions[1].getAttribute('aria-selected')).toBe('false');

    // Selection shows as a check icon inside the swatch, contrast-colored.
    const check = presetOptions[0].querySelector('.tls-color-swatch-picker__check');
    expect(check).not.toBeNull();
    expect(presetOptions[1].querySelector('.tls-color-swatch-picker__check')).toBeNull();

    presetOptions[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    expect(host.value()).toBe('#00ff00');
  });

  it('shows the hex readout in uppercase when hexCase is upper, emitting lowercase', async () => {
    host.value.set('#3b82f6');
    host.hexCase.set('upper');
    await settle();

    expect(readout().value).toBe('#3B82F6');
    expect(host.value()).toBe('#3b82f6');

    // Only the hex notation is case-styled.
    query<HTMLButtonElement>('.tls-color-picker__readout-format').click();
    await settle();
    expect(readout().value).toBe('rgb(59, 130, 246)');
  });

  it('shows the alpha slider and emits 8-digit hex only when alpha is enabled', async () => {
    expect(fixture.nativeElement.querySelector('.tls-color-range--alpha')).toBeNull();

    host.alpha.set(true);
    await settle();

    await setRange(alphaRange(), '50');
    expect(host.value()).toBe('#ff000080');
  });

  it('hides the eyedropper when the platform does not support it', () => {
    expect(fixture.nativeElement.querySelector('.tls-color-picker__eyedropper')).toBeNull();
  });

  it('disables the interactive controls when disabled', async () => {
    host.disabled.set(true);
    await settle();

    expect(hueRange().disabled).toBe(true);
    expect(readout().disabled).toBe(true);
    expect(svThumb().getAttribute('tabindex')).toBe('-1');
  });
});
