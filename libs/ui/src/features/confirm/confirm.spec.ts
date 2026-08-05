import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Event as RouterEvent, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Confirm } from './confirm';
import { ConfirmService } from './confirm.service';
import { confirmActionsAlign, confirmButton, confirmSize } from './confirm.types';

@Component({
  imports: [Confirm],
  template: `
    <button #trigger type="button">Trigger</button>
    <tls-confirm
      [title]="title()"
      [message]="message()"
      [confirm]="confirm()"
      [cancel]="cancel()"
      [actionsAlign]="actionsAlign()"
      [size]="size()"
      (confirmed)="onConfirmed()"
      (cancelled)="onCancelled()"
    ></tls-confirm>
  `,
})
class HostComponent {
  public readonly title = signal<string | undefined>(undefined);
  public readonly message = signal('Delete this program?');
  public readonly confirm = signal<confirmButton | undefined>(undefined);
  public readonly cancel = signal<confirmButton | undefined>(undefined);
  public readonly actionsAlign = signal<confirmActionsAlign>('end');
  public readonly size = signal<confirmSize>('md');
  public readonly dialog = viewChild.required(Confirm);

  public confirmedCount = 0;
  public cancelledCount = 0;

  public onConfirmed(): void {
    this.confirmedCount++;
  }

  public onCancelled(): void {
    this.cancelledCount++;
  }
}

describe('Confirm', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let trigger: HTMLButtonElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const getDialog = () => host.dialog();
  const queryPanel = () => overlayContainerElement.querySelector<HTMLElement>('.tls-confirm');
  const queryActions = () =>
    overlayContainerElement.querySelectorAll<HTMLButtonElement>('.tls-confirm__actions button');
  const queryBackdrop = () =>
    overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    trigger = fixture.nativeElement.querySelector('button');
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should start closed', () => {
    expect(getDialog().isOpen()).toBe(false);
    expect(queryPanel()).toBeNull();
  });

  it('should open the panel with the message and alertdialog role', () => {
    getDialog().open(trigger);
    fixture.detectChanges();

    const panel = queryPanel();
    expect(getDialog().isOpen()).toBe(true);
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('role')).toBe('alertdialog');
    expect(panel?.querySelector('.tls-confirm__message')?.textContent).toContain(
      'Delete this program?',
    );
  });

  it('should render the title and wire aria-labelledby when provided', () => {
    host.title.set('Delete program');
    fixture.detectChanges();

    getDialog().open(trigger);
    fixture.detectChanges();

    const panel = queryPanel();
    const title = panel?.querySelector<HTMLElement>('.tls-confirm__title');
    expect(title?.textContent).toContain('Delete program');
    expect(panel?.getAttribute('aria-labelledby')).toBe(title?.id);
  });

  it('should apply caller button appearance', () => {
    host.confirm.set({ label: 'Delete', color: 'danger' });
    fixture.detectChanges();

    getDialog().open(trigger);
    fixture.detectChanges();

    const confirmButton = queryActions().item(1);
    expect(confirmButton.textContent).toContain('Delete');
    expect(confirmButton.classList).toContain('tls-button--danger');
  });

  it('should reflect actionsAlign as a modifier class on the actions row', () => {
    host.actionsAlign.set('space-between');
    fixture.detectChanges();

    getDialog().open(trigger);
    fixture.detectChanges();

    const actions = overlayContainerElement.querySelector<HTMLElement>('.tls-confirm__actions');
    expect(actions?.classList).toContain('tls-confirm__actions--space-between');
    expect(actions?.classList).not.toContain('tls-confirm__actions--end');
  });

  it('should reflect size as a modifier class on the panel', () => {
    host.size.set('lg');
    fixture.detectChanges();

    getDialog().open(trigger);
    fixture.detectChanges();

    const panel = queryPanel();
    expect(panel?.classList).toContain('tls-confirm');
    expect(panel?.classList).toContain('tls-confirm--lg');
    expect(panel?.classList).not.toContain('tls-confirm--md');
  });

  it('should emit confirmed and close when the confirm button is clicked', () => {
    getDialog().open(trigger);
    fixture.detectChanges();

    queryActions().item(1).click();
    fixture.detectChanges();

    expect(host.confirmedCount).toBe(1);
    expect(host.cancelledCount).toBe(0);
    expect(getDialog().isOpen()).toBe(false);
  });

  it('should emit cancelled and close when the cancel button is clicked', () => {
    getDialog().open(trigger);
    fixture.detectChanges();

    queryActions().item(0).click();
    fixture.detectChanges();

    expect(host.cancelledCount).toBe(1);
    expect(host.confirmedCount).toBe(0);
    expect(getDialog().isOpen()).toBe(false);
  });

  it('should report a backdrop dismissal as a single cancellation', () => {
    getDialog().open(trigger);
    fixture.detectChanges();

    queryBackdrop()?.click();
    fixture.detectChanges();

    expect(host.cancelledCount).toBe(1);
    expect(host.confirmedCount).toBe(0);
    expect(getDialog().isOpen()).toBe(false);
  });

  it('should report an Escape dismissal as cancelled', () => {
    getDialog().open(trigger);
    fixture.detectChanges();

    queryPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(host.cancelledCount).toBe(1);
    expect(getDialog().isOpen()).toBe(false);
  });

  it('should not emit cancelled again on the close that follows a confirm', () => {
    getDialog().open(trigger);
    fixture.detectChanges();

    queryActions().item(1).click();
    fixture.detectChanges();

    expect(host.confirmedCount).toBe(1);
    expect(host.cancelledCount).toBe(0);
  });
});

describe('ConfirmService', () => {
  let service: ConfirmService;
  let trigger: HTMLButtonElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const queryPanel = () => overlayContainerElement.querySelector<HTMLElement>('.tls-confirm');
  const queryActions = () =>
    overlayContainerElement.querySelectorAll<HTMLButtonElement>('.tls-confirm__actions button');
  const queryBackdrop = () =>
    overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop');

  beforeEach(() => {
    service = TestBed.inject(ConfirmService);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();

    trigger = document.createElement('button');
    document.body.appendChild(trigger);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    trigger.remove();
  });

  it('should open a panel anchored to the trigger', () => {
    service.confirm({ trigger, message: 'Delete this program?' });
    TestBed.tick();

    expect(queryPanel()).not.toBeNull();
    expect(queryPanel()?.querySelector('.tls-confirm__message')?.textContent).toContain(
      'Delete this program?',
    );
  });

  it('should resolve true when the confirm button is clicked', async () => {
    const result = service.confirm({ trigger, message: 'Delete this program?' });
    TestBed.tick();

    queryActions().item(1).click();

    await expect(result).resolves.toBe(true);
  });

  it('should resolve false when the cancel button is clicked', async () => {
    const result = service.confirm({ trigger, message: 'Delete this program?' });
    TestBed.tick();

    queryActions().item(0).click();

    await expect(result).resolves.toBe(false);
  });

  it('should resolve false when the backdrop is clicked', async () => {
    const result = service.confirm({ trigger, message: 'Delete this program?' });
    TestBed.tick();

    queryBackdrop()?.click();

    await expect(result).resolves.toBe(false);
  });

  it('should render an anchored (non-modal) panel when a trigger is given', () => {
    service.confirm({ trigger, message: 'Delete this program?' });
    TestBed.tick();

    expect(queryPanel()?.getAttribute('aria-modal')).toBe('false');
  });

  it('should restore focus to the opener when dismissed', async () => {
    trigger.focus();
    const result = service.confirm({ trigger, message: 'Delete this program?' });
    TestBed.tick();

    queryActions().item(0).click();
    await result;

    expect(document.activeElement).toBe(trigger);
  });

  describe('modal (no trigger)', () => {
    it('should open a centered modal panel with aria-modal true', () => {
      service.confirm({ message: 'Delete your account?' });
      TestBed.tick();

      const panel = queryPanel();
      expect(panel).not.toBeNull();
      expect(panel?.getAttribute('aria-modal')).toBe('true');
    });

    it('should resolve true when the confirm button is clicked', async () => {
      const result = service.confirm({ message: 'Delete your account?' });
      TestBed.tick();

      queryActions().item(1).click();

      await expect(result).resolves.toBe(true);
    });

    it('should resolve false when dismissed via Escape', async () => {
      const result = service.confirm({ message: 'Delete your account?' });
      TestBed.tick();

      queryPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      await expect(result).resolves.toBe(false);
    });
  });
});

describe('ConfirmService navigation dismissal', () => {
  let service: ConfirmService;
  let routerEvents: Subject<RouterEvent>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let trigger: HTMLButtonElement;

  const queryPanel = () => overlayContainerElement.querySelector<HTMLElement>('.tls-confirm');

  beforeEach(() => {
    routerEvents = new Subject<RouterEvent>();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { events: routerEvents.asObservable() } }],
    });

    service = TestBed.inject(ConfirmService);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();

    trigger = document.createElement('button');
    document.body.appendChild(trigger);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    trigger.remove();
  });

  it('should dismiss and resolve false when navigation starts', async () => {
    const result = service.confirm({ trigger, message: 'Delete this program?' });
    TestBed.tick();
    expect(queryPanel()).not.toBeNull();

    routerEvents.next(new NavigationStart(1, '/next'));

    await expect(result).resolves.toBe(false);
    expect(queryPanel()).toBeNull();
  });
});
