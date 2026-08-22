import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { size } from '../../types';
import { ColorSwatch } from './color-swatch';

@Component({
  imports: [ColorSwatch],
  template: `<tls-color-swatch [value]="value()" [size]="size()" [ariaLabel]="ariaLabel()" />`,
})
class HostComponent {
  value = signal('#3b82f6');
  size = signal<size>('md');
  ariaLabel = signal<string | undefined>(undefined);
}

describe('ColorSwatch', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const swatch = (): HTMLElement => {
    const element = fixture.nativeElement.querySelector('tls-color-swatch');
    if (!element) throw new Error('tls-color-swatch not rendered');
    return element;
  };

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

  it('applies the base and size classes', async () => {
    expect(swatch().classList).toContain('tls-color-swatch');
    expect(swatch().classList).toContain('tls-color-swatch--md');

    host.size.set('lg');
    await settle();

    expect(swatch().classList).toContain('tls-color-swatch--lg');
    expect(swatch().classList).not.toContain('tls-color-swatch--md');
  });

  it('exposes the color through a custom property', async () => {
    expect(swatch().style.getPropertyValue('--tls-color-swatch-color')).toBe('#3b82f6');

    host.value.set('#ff000080');
    await settle();

    expect(swatch().style.getPropertyValue('--tls-color-swatch-color')).toBe('#ff000080');
  });

  it('names itself as an image with the color value', () => {
    expect(swatch().getAttribute('role')).toBe('img');
    expect(swatch().getAttribute('aria-label')).toBe('#3b82f6');
  });

  it('prefers an explicit ariaLabel over the color value', async () => {
    host.ariaLabel.set('Brand blue');
    await settle();

    expect(swatch().getAttribute('aria-label')).toBe('Brand blue');
  });
});
