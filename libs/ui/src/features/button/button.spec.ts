import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `
    <tls-button
      [disabled]="disabled()"
      [inactive]="inactive()"
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
