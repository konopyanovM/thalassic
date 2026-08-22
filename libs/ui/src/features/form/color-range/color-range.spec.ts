import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorRange } from './color-range';
import { colorRangeChannel, colorRangeSize } from './color-range.types';

@Component({
  imports: [ColorRange],
  template: `<tls-color-range
    [channel]="channel()"
    [value]="value()"
    (valueChange)="value.set($event)"
    [color]="color()"
    [size]="size()"
    [disabled]="disabled()"
    [readonly]="readonly()"
  />`,
})
class HostComponent {
  channel = signal<colorRangeChannel>('hue');
  value = signal(0);
  color = signal('#ff0000');
  size = signal<colorRangeSize>('md');
  disabled = signal(false);
  readonly = signal(false);
}

describe('ColorRange', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const range = (): HTMLInputElement => {
    const element = fixture.nativeElement.querySelector('.tls-color-range-input');
    if (!element) throw new Error('range input not rendered');
    return element;
  };

  const hostElement = (): HTMLElement => fixture.nativeElement.querySelector('tls-color-range');

  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const slide = async (rangeValue: string): Promise<void> => {
    range().value = rangeValue;
    range().dispatchEvent(new Event('input'));
    await settle();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  it('spans the hue scale and emits the slid number', async () => {
    expect(range().max).toBe('360');
    expect(hostElement().classList).toContain('tls-color-range--hue');

    await slide('120');
    expect(host.value()).toBe(120);
  });

  it('applies the size class, defaulting to md', async () => {
    expect(hostElement().classList).toContain('tls-color-range--md');

    host.size.set('xs');
    await settle();

    expect(hostElement().classList).toContain('tls-color-range--xs');
    expect(hostElement().classList).not.toContain('tls-color-range--md');
  });

  it('spans percent for the alpha channel', async () => {
    host.channel.set('alpha');
    await settle();

    expect(range().max).toBe('100');
    expect(hostElement().classList).toContain('tls-color-range--alpha');
  });

  it('exposes the reference color for the alpha gradient', async () => {
    host.channel.set('alpha');
    await settle();

    expect(hostElement().style.getPropertyValue('--tls-color-range-color')).toBe('#ff0000');
  });

  it('paints the thumb with the current hue', async () => {
    await slide('120');

    expect(hostElement().style.getPropertyValue('--tls-color-range-thumb-color')).toBe(
      'hsl(120, 100%, 50%)',
    );
  });

  it('paints the alpha thumb with the reference color', async () => {
    host.channel.set('alpha');
    await settle();

    expect(hostElement().style.getPropertyValue('--tls-color-range-thumb-color')).toBe('#ff0000');
  });

  it('names itself after the channel by default', async () => {
    expect(range().getAttribute('aria-label')).toBe('Hue');

    host.channel.set('alpha');
    await settle();
    expect(range().getAttribute('aria-label')).toBe('Opacity');
  });

  it('reverts interaction while readonly', async () => {
    host.readonly.set(true);
    await settle();

    await slide('180');
    expect(host.value()).toBe(0);
    expect(range().value).toBe('0');
  });

  it('disables the input when disabled', async () => {
    host.disabled.set(true);
    await settle();

    expect(range().disabled).toBe(true);
  });
});
