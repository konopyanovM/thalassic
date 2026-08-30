import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Icon } from '../icon';
import { Alert } from './alert';
import { AlertIcon } from './alert-icon';

@Component({
  imports: [Alert, AlertIcon, Icon],
  template: `
    <tls-alert [color]="'danger'" [hideIcon]="hideIcon()">
      <tls-icon tlsAlertIcon name="star" />
      Projected content
    </tls-alert>
  `,
})
class AlertHost {
  readonly hideIcon = signal(false);
}

describe('Alert', () => {
  let component: Alert;
  let fixture: ComponentFixture<Alert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alert],
    }).compileComponents();

    fixture = TestBed.createComponent(Alert);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the color-derived icon by default', async () => {
    fixture.componentRef.setInput('color', 'warning');
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.tls-alert__icon').length).toBe(1);
  });

  it('omits the icon when hidden', async () => {
    fixture.componentRef.setInput('hideIcon', true);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.tls-alert__icon')).toBeNull();
  });

  it('renders a single icon when one is projected, and drops it when hidden', async () => {
    const hostFixture = TestBed.createComponent(AlertHost);
    await hostFixture.whenStable();

    const host = hostFixture.nativeElement as HTMLElement;
    const icons = host.querySelectorAll('.tls-alert__icon');
    expect(icons.length).toBe(1);
    expect(icons[0].hasAttribute('tlsAlertIcon')).toBe(true);

    hostFixture.componentInstance.hideIcon.set(true);
    await hostFixture.whenStable();

    expect(host.querySelector('.tls-alert__icon')).toBeNull();
  });

  it('renders no close button by default', async () => {
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.tls-alert__close')).toBeNull();
  });

  it('emits dismissed when the close button is pressed', async () => {
    fixture.componentRef.setInput('closable', true);
    fixture.componentRef.setInput('dismissLabel', 'Close the alert');
    await fixture.whenStable();

    let dismissals = 0;
    component.dismissed.subscribe(() => dismissals++);

    const host = fixture.nativeElement as HTMLElement;
    const close = host.querySelector<HTMLButtonElement>('.tls-alert__close');
    if (!close) throw new Error('close button not rendered');
    expect(close.getAttribute('aria-label')).toBe('Close the alert');

    close.click();
    expect(dismissals).toBe(1);
  });
});
