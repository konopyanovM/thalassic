import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSwatchPicker } from './color-swatch-picker';

@Component({
  imports: [ColorSwatchPicker],
  template: `<tls-color-swatch-picker
    [colors]="colors()"
    [value]="value()"
    (valueChange)="value.set($event)"
    [disabled]="disabled()"
    [readonly]="readonly()"
    ariaLabel="Colors"
  />`,
})
class HostComponent {
  colors = signal(['#FF0000', '#00ff00', '#0000ff', '#ffffff']);
  value = signal('');
  disabled = signal(false);
  readonly = signal(false);
}

describe('ColorSwatchPicker', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const query = <T extends HTMLElement>(selector: string): T => {
    const element = fixture.nativeElement.querySelector(selector);
    if (!element) throw new Error(`${selector} not rendered`);
    return element;
  };

  const options = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('[role="option"]'));

  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  it('renders the colors as options of a labelled listbox, each showing its swatch', () => {
    const listbox = query('[role="listbox"]');
    expect(listbox.getAttribute('aria-label')).toBe('Colors');

    const rendered = options();
    expect(rendered.length).toBe(4);
    for (const option of rendered) {
      expect(option.querySelector('.tls-color-swatch')).toBeTruthy();
    }
  });

  it('marks the option matching the value as selected, whatever the notation', async () => {
    host.value.set('#ff0000');
    await settle();

    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    expect(options()[1].getAttribute('aria-selected')).toBe('false');
  });

  it('shows a check mark on the selected swatch, tinted for contrast', async () => {
    host.value.set('#ffffff');
    await settle();

    const check = query('.tls-color-swatch-picker__check');
    expect(options()[3].contains(check)).toBe(true);
    expect(check.style.color).toBe('rgb(0, 0, 0)');
  });

  it('commits the clicked color as a normalized lowercase hex', async () => {
    options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();

    expect(host.value()).toBe('#ff0000');
  });

  it('marks the control touched when a color is committed', async () => {
    const picker = fixture.debugElement.children[0].componentInstance as ColorSwatchPicker;
    expect(picker.touched()).toBe(false);

    options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();

    expect(picker.touched()).toBe(true);
  });

  it('keeps the alpha channel of an 8-digit color in the committed value', async () => {
    host.colors.set(['#3B82F680']);
    await settle();

    options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();

    expect(host.value()).toBe('#3b82f680');
  });

  it('does not commit while disabled', async () => {
    host.disabled.set(true);
    await settle();

    options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();

    expect(host.value()).toBe('');
  });

  it('does not commit while readonly', async () => {
    host.readonly.set(true);
    await settle();

    options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();

    expect(host.value()).toBe('');
  });

  it('selects with the keyboard: arrows navigate, Space commits', async () => {
    host.value.set('#ff0000');
    await settle();

    const listbox = query('[role="listbox"]');
    options()[0].focus();
    listbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await settle();
    expect(host.value()).toBe('#ff0000');

    listbox.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await settle();
    expect(host.value()).toBe('#00ff00');
  });
});
