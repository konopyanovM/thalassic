import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Slider } from './slider';

@Component({
  imports: [Slider],
  template: `
    <tls-slider
      [value]="value()"
      (valueChange)="value.set($event)"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [readonly]="readonly()"
      [disabled]="disabled()"
      ariaLabel="Zoom"
    />
  `,
})
class HostComponent {
  readonly value = signal(50);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(1);
  readonly readonly = signal(false);
  readonly disabled = signal(false);
}

describe('Slider', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
  }

  async function drag(to: string): Promise<void> {
    const element = input();
    element.value = to;
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('renders a native range input carrying the bounds and the accessible name', () => {
    const element = input();

    expect(element.min).toBe('0');
    expect(element.max).toBe('100');
    expect(element.step).toBe('1');
    expect(element.value).toBe('50');
    expect(element.getAttribute('aria-label')).toBe('Zoom');
  });

  it('reflects the value as the track fill ratio', async () => {
    expect(input().style.getPropertyValue('--tls-slider-fill')).toBe('0.5');

    host.value.set(75);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input().style.getPropertyValue('--tls-slider-fill')).toBe('0.75');
  });

  it('measures the fill against the bounds, not against 0–100', async () => {
    host.min.set(1);
    host.max.set(5);
    host.value.set(2);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input().style.getPropertyValue('--tls-slider-fill')).toBe('0.25');
  });

  it('commits a drag to the value model', async () => {
    await drag('80');

    expect(host.value()).toBe(80);
  });

  it('reverts a drag while readonly, since a range input has no native readonly', async () => {
    host.readonly.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    await drag('80');

    expect(host.value()).toBe(50);
    expect(input().value).toBe('50');
  });

  it('marks itself readonly and disabled for assistive technology', async () => {
    host.readonly.set(true);
    host.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input().getAttribute('aria-readonly')).toBe('true');
    expect(input().disabled).toBe(true);
  });

  it('marks the control touched on blur', async () => {
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input().classList).toContain('tls-slider--touched');
  });
});
