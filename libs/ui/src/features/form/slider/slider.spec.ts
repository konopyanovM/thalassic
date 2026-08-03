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
      [showTooltip]="showTooltip()"
      [valueText]="valueText()"
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
  readonly showTooltip = signal(false);
  readonly valueText = signal<string | undefined>(undefined);
}

describe('Slider', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function host(): HTMLElement {
    return fixture.nativeElement.querySelector('tls-slider') as HTMLElement;
  }

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
  }

  function tooltip(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.tls-slider-tooltip') as HTMLElement | null;
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function drag(to: string): Promise<void> {
    const element = input();
    element.value = to;
    element.dispatchEvent(new Event('input'));
    await settle();
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
    expect(host().style.getPropertyValue('--tls-slider-fill')).toBe('0.5');

    component.value.set(75);
    await settle();

    expect(host().style.getPropertyValue('--tls-slider-fill')).toBe('0.75');
  });

  it('measures the fill against the bounds, not against 0–100', async () => {
    component.min.set(1);
    component.max.set(5);
    component.value.set(2);
    await settle();

    expect(host().style.getPropertyValue('--tls-slider-fill')).toBe('0.25');
  });

  it('commits a drag to the value model', async () => {
    await drag('80');

    expect(component.value()).toBe(80);
  });

  it('reverts a drag while readonly, since a range input has no native readonly', async () => {
    component.readonly.set(true);
    await settle();

    await drag('80');

    expect(component.value()).toBe(50);
    expect(input().value).toBe('50');
  });

  it('marks itself readonly and disabled for assistive technology', async () => {
    component.readonly.set(true);
    component.disabled.set(true);
    await settle();

    expect(input().getAttribute('aria-readonly')).toBe('true');
    expect(input().disabled).toBe(true);
  });

  it('marks the control touched on blur', async () => {
    input().dispatchEvent(new Event('blur'));
    await settle();

    expect(host().classList).toContain('tls-slider--touched');
  });

  it('renders no value tooltip unless asked for one', () => {
    expect(tooltip()).toBeNull();
  });

  it('shows the current value in the tooltip and follows the value', async () => {
    component.showTooltip.set(true);
    await settle();

    expect(tooltip()?.textContent?.trim()).toBe('50');

    await drag('80');

    expect(tooltip()?.textContent?.trim()).toBe('80');
  });

  it('prefers the spelled-out value in the tooltip', async () => {
    component.showTooltip.set(true);
    component.valueText.set('2.5×');
    await settle();

    expect(tooltip()?.textContent?.trim()).toBe('2.5×');
  });

  it('hides the tooltip from assistive technology, since the input announces the value', async () => {
    component.showTooltip.set(true);
    await settle();

    expect(tooltip()?.getAttribute('aria-hidden')).toBe('true');
  });
});
