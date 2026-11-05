import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';
import { DEFAULT_BUTTON_CONFIG } from './button.config';
import { BUTTON_CONFIG } from './button.token';

@Component({
  imports: [Button],
  template: `
    <tls-button
      [disabled]="disabled()"
      [inactive]="inactive()"
      [busy]="busy()"
      ariaLabel="Next"
      (click)="clicks = clicks + 1"
    >
      Next
    </tls-button>
  `,
})
class HostComponent {
  readonly disabled = signal(false);
  readonly inactive = signal(false);
  readonly busy = signal(false);

  clicks = 0;
}

describe('Button', () => {
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

  function control(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('renders an enabled control with the forwarded accessible name', () => {
    expect(control().getAttribute('aria-label')).toBe('Next');
    expect(control().hasAttribute('aria-disabled')).toBe(false);
    expect(control().disabled).toBe(false);
  });

  it('disables the control natively and marks it aria-disabled', async () => {
    host.disabled.set(true);
    await settle();

    expect(control().disabled).toBe(true);
    expect(control().getAttribute('aria-disabled')).toBe('true');
    expect(control().classList).toContain('tls-button--disabled');
  });

  it('keeps an inactive control focusable and refuses its clicks', async () => {
    host.inactive.set(true);
    await settle();

    expect(control().disabled).toBe(false);
    expect(control().tabIndex).toBe(0);
    expect(control().getAttribute('aria-disabled')).toBe('true');
    // Unavailability reads the same however it is enforced.
    expect(control().classList).toContain('tls-button--disabled');

    control().click();
    await settle();

    expect(host.clicks).toBe(0);
  });

  it('shows a spinner on a busy control, reports it busy, and refuses its clicks', async () => {
    host.busy.set(true);
    await settle();

    expect(control().getAttribute('aria-busy')).toBe('true');
    expect(control().classList).toContain('tls-button--busy');
    expect(control().querySelector('.tls-button__spinner')).not.toBeNull();
    // Busy is not unavailability: it keeps its look and its place in the tab order.
    expect(control().disabled).toBe(false);
    expect(control().classList).not.toContain('tls-button--disabled');

    control().click();
    await settle();

    expect(host.clicks).toBe(0);
  });

  it('acts on a click once it is no longer inactive', async () => {
    host.inactive.set(true);
    await settle();
    control().click();

    host.inactive.set(false);
    await settle();
    control().click();
    await settle();

    expect(host.clicks).toBe(1);
  });
});

@Component({
  imports: [Button],
  template: `
    <tls-button icon ariaLabel="More" />
    <tls-button icon ariaLabel="Close" [rounded]="false" />
    <tls-button icon rounded ariaLabel="Add" />
    <tls-button>Save</tls-button>
  `,
})
class ShapeHostComponent {}

describe('Button shape', () => {
  async function render(iconRounded: boolean): Promise<HTMLElement[]> {
    await TestBed.configureTestingModule({
      imports: [ShapeHostComponent],
      providers: [{ provide: BUTTON_CONFIG, useValue: { ...DEFAULT_BUTTON_CONFIG, iconRounded } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ShapeHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    return Array.from(fixture.nativeElement.querySelectorAll('button'));
  }

  function isRounded(control: HTMLElement): boolean {
    return control.classList.contains('tls-button--rounded');
  }

  it('rounds an unset icon-only button when the config asks, and nothing else', async () => {
    const [more, close, add, save] = await render(true);

    expect(isRounded(more)).toBe(true);
    expect(isRounded(close)).toBe(false);
    expect(isRounded(add)).toBe(true);
    expect(isRounded(save)).toBe(false);
  });

  it('keeps corners on an unset button when the config does not ask', async () => {
    const [more, close, add, save] = await render(false);

    expect(isRounded(more)).toBe(false);
    expect(isRounded(close)).toBe(false);
    expect(isRounded(add)).toBe(true);
    expect(isRounded(save)).toBe(false);
  });
});
