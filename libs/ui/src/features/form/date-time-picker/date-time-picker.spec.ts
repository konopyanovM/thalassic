import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTimePicker } from './date-time-picker';
import { dateTimePickerMode } from './date-time-picker.types';

@Component({
  imports: [DateTimePicker],
  template: `<tls-date-time-picker
    [value]="value()"
    [mode]="mode()"
    [inline]="inline()"
    [minDate]="minDate()"
  />`,
})
class HostComponent {
  public readonly value = signal<Date | null>(null);
  public readonly mode = signal<dateTimePickerMode>('calendar');
  public readonly inline = signal(false);
  public readonly minDate = signal<Date | null>(null);
  public readonly picker = viewChild.required(DateTimePicker);
}

/**
 * Characterization tests for the overlay behavior DateTimePicker delegates to
 * the shared Popover (trigger toggles the panel, selecting a day in calendar
 * mode dismisses it, inline mode renders in place, Escape/backdrop dismiss).
 * These pin the observable behavior so it survives the planned extraction of a
 * shared overlay primitive.
 */
describe('DateTimePicker', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const queryTrigger = () =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.tls-date-time-picker__trigger',
    );
  const queryPopover = () => overlayContainerElement.querySelector<HTMLElement>('.tls-popover');
  const queryBackdrop = () =>
    overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop');
  const queryHeader = (root: HTMLElement = overlayContainerElement) =>
    root.querySelector<HTMLButtonElement>(
      '.tls-date-picker-calendar__header-button, .tls-month-picker__header-button, .tls-year-picker__header-button',
    );
  const queryNavigation = (root: HTMLElement = overlayContainerElement) =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('.tls-date-picker-calendar__nav'));
  const toggle = () => {
    queryTrigger()?.click();
    fixture.detectChanges();
  };
  const queryDays = () =>
    Array.from(overlayContainerElement.querySelectorAll<HTMLButtonElement>('.tls-date-picker-calendar__day'));

  const setup = async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create', async () => {
    await setup();
    expect(host.picker()).toBeTruthy();
  });

  describe('popover (non-inline)', () => {
    beforeEach(setup);

    it('should render a trigger that is collapsed by default', () => {
      const trigger = queryTrigger();
      expect(trigger).not.toBeNull();
      expect(trigger?.getAttribute('aria-expanded')).toBe('false');
      expect(queryPopover()).toBeNull();
    });

    it('should open the popover on trigger click', () => {
      queryTrigger()?.click();
      fixture.detectChanges();

      expect(queryPopover()).not.toBeNull();
      expect(queryTrigger()?.getAttribute('aria-expanded')).toBe('true');
    });

    it('should close the popover on a second trigger click', () => {
      queryTrigger()?.click();
      fixture.detectChanges();
      queryTrigger()?.click();
      fixture.detectChanges();

      expect(queryPopover()).toBeNull();
    });

    it('should close the popover on backdrop click', () => {
      queryTrigger()?.click();
      fixture.detectChanges();

      queryBackdrop()?.click();
      fixture.detectChanges();

      expect(queryPopover()).toBeNull();
    });

    it('should close the popover on Escape', () => {
      queryTrigger()?.click();
      fixture.detectChanges();

      queryPopover()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(queryPopover()).toBeNull();
    });

    it('should set the value and close the popover when a day is picked in calendar mode', () => {
      queryTrigger()?.click();
      fixture.detectChanges();

      const days = queryDays();
      expect(days.length).toBeGreaterThan(0);
      days[10].click();
      fixture.detectChanges();

      expect(host.picker().value()).toBeInstanceOf(Date);
      expect(queryPopover()).toBeNull();
    });
  });

  describe('view on open', () => {
    beforeEach(setup);

    it('should open on the month of the selected date, not the current one', () => {
      host.value.set(new Date(2017, 2, 15));
      fixture.detectChanges();
      toggle();

      expect(queryHeader()?.textContent?.trim()).toBe('March 2017');
    });

    it('should discard browsing when closed, reopening on the selected month', () => {
      host.value.set(new Date(2017, 2, 15));
      fixture.detectChanges();
      toggle();
      queryNavigation()[1].click();
      fixture.detectChanges();
      expect(queryHeader()?.textContent?.trim()).toBe('April 2017');

      toggle();
      toggle();

      expect(queryHeader()?.textContent?.trim()).toBe('March 2017');
    });

    it('should reopen on the day grid after drilling up to the month list', () => {
      toggle();
      queryHeader()?.click();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.tls-month-picker__grid')).not.toBeNull();

      toggle();
      toggle();

      expect(overlayContainerElement.querySelector('.tls-date-picker-calendar__grid')).not.toBeNull();
    });

    it('should open an empty picker on the earliest selectable month when today falls before it', () => {
      host.minDate.set(new Date(2099, 5, 1));
      fixture.detectChanges();
      toggle();

      expect(queryHeader()?.textContent?.trim()).toBe('June 2099');
    });
  });

  describe('inline mode', () => {
    beforeEach(async () => {
      await setup();
      host.inline.set(true);
      fixture.detectChanges();
    });

    it('should render the panel in place without a trigger or overlay', () => {
      expect(queryTrigger()).toBeNull();
      expect(fixture.nativeElement.querySelector('.tls-date-time-picker__panel')).not.toBeNull();
      expect(queryPopover()).toBeNull();
    });

    it('should move the view to a value set from outside', () => {
      host.value.set(new Date(2017, 2, 15));
      fixture.detectChanges();

      expect(queryHeader(fixture.nativeElement)?.textContent?.trim()).toBe('March 2017');
    });
  });
});
