import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSwatchPicker } from './color-swatch-picker';

@Component({
  imports: [ColorSwatchPicker],
  template: `<tls-color-swatch-picker
    [options]="colors()"
    [value]="value()"
    (valueChange)="value.set($event)"
    [disabled]="disabled()"
    [readonly]="readonly()"
    ariaLabel="Colors"
  />`,
})
class HostComponent {
  colors = signal(['#FF0000', '#00ff00', '#0000ff', '#ffffff']);
  value = signal<string | null>(null);
  disabled = signal(false);
  readonly = signal(false);
}

interface Accent {
  id: string;
  name: string;
  token: string;
}

@Component({
  imports: [ColorSwatchPicker],
  template: `<tls-color-swatch-picker
    [options]="accents"
    optionValue="id"
    optionLabel="name"
    optionColor="token"
    [value]="value()"
    (valueChange)="value.set($event)"
    ariaLabel="Accents"
  />`,
})
class AccentHostComponent {
  accents: Accent[] = [
    { id: 'blue', name: 'Blue', token: 'var(--color-blue)' },
    { id: 'orange', name: 'Orange', token: 'var(--color-orange)' },
  ];
  value = signal<string | null>(null);
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

  // A plain color list stores the color itself, so what was offered is what is
  // committed — the control never rewrites the consumer's own notation.
  it('commits the clicked color as it was offered', async () => {
    options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();

    expect(host.value()).toBe('#FF0000');
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

    expect(host.value()).toBe('#3B82F680');
  });

  it('does not commit while disabled', async () => {
    host.disabled.set(true);
    await settle();

    options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();

    expect(host.value()).toBeNull();
  });

  it('does not commit while readonly', async () => {
    host.readonly.set(true);
    await settle();

    options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();

    expect(host.value()).toBeNull();
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

  // Options carrying their own value, name and color are what let a theme token
  // be offered: the swatch paints something no color parser can read, while the
  // value committed is the consumer's own identifier for that choice.
  describe('with options carrying their color', () => {
    let accentFixture: ComponentFixture<AccentHostComponent>;
    let accentHost: AccentHostComponent;

    const accentOptions = (): HTMLElement[] =>
      Array.from(accentFixture.nativeElement.querySelectorAll('[role="option"]'));

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({ imports: [AccentHostComponent] }).compileComponents();
      accentFixture = TestBed.createComponent(AccentHostComponent);
      accentHost = accentFixture.componentInstance;
      accentFixture.detectChanges();
      await accentFixture.whenStable();
    });

    it('paints each swatch with the color its option names', () => {
      const swatch = accentOptions()[0].querySelector<HTMLElement>('.tls-color-swatch');
      expect(swatch?.style.getPropertyValue('--tls-color-swatch-color')).toBe('var(--color-blue)');
    });

    it('names each option by its label rather than by the color drawn', () => {
      expect(accentOptions()[0].getAttribute('aria-label')).toBe('Blue');
    });

    it('commits the option value, not the color', async () => {
      accentOptions()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      accentFixture.detectChanges();
      await accentFixture.whenStable();

      expect(accentHost.value()).toBe('orange');
    });

    it('shows the stored value as the selection', async () => {
      accentHost.value.set('orange');
      accentFixture.detectChanges();
      await accentFixture.whenStable();

      expect(accentOptions()[1].getAttribute('aria-selected')).toBe('true');
      expect(accentOptions()[0].getAttribute('aria-selected')).toBe('false');
    });
  });
});
